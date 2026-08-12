import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./BacariShiftTrader.css";

type WeekDay = {
  id: string;
  shortName: string;
  label: string;
  dateLabel: string;
};

type CalendarNames = Record<string, string[]>;

type ShiftTraderNameRow = {
  id: string;
  shift_date: string;
  name: string;
  created_at: string;
};

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

const shortDayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function getDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDays(weekOffset: number): WeekDay[] {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - mondayOffset + weekOffset * 7);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return {
      id: getDateId(day),
      shortName: shortDayFormatter.format(day),
      label: dayFormatter.format(day),
      dateLabel: dateFormatter.format(day),
    };
  });
}

function BacariShiftTrader() {
  const todayId = getDateId(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const [selectedDayId, setSelectedDayId] = useState(todayId);
  const [nameInput, setNameInput] = useState("");
  const [calendarNames, setCalendarNames] = useState<CalendarNames>({});
  const [isLoadingNames, setIsLoadingNames] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const savedRowIdsRef = useRef(new Set<string>());

  const selectedDay = weekDays.find((day) => day.id === selectedDayId) ?? weekDays[0];
  const totalNames = Object.values(calendarNames).reduce(
    (total, names) => total + names.length,
    0
  );

  useEffect(() => {
    const loadWeekNames = async () => {
      const startDate = weekDays[0].id;
      const endDate = weekDays[weekDays.length - 1].id;

      setIsLoadingNames(true);
      setErrorMessage("");

      const { error: cleanupError } = await supabase.rpc(
        "cleanup_old_bacari_shift_trader_names",
        {
          today_date: getDateId(new Date()),
        }
      );

      if (cleanupError) {
        console.error(cleanupError);
      }

      const { data, error } = await supabase
        .from("bacari_shift_trader_names")
        .select("id, shift_date, name, created_at")
        .gte("shift_date", startDate)
        .lte("shift_date", endDate)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMessage("Could not load names from the database.");
        setIsLoadingNames(false);
        return;
      }

      const nextCalendarNames = weekDays.reduce<CalendarNames>((days, day) => {
        days[day.id] = [];
        return days;
      }, {});

      (data as ShiftTraderNameRow[] | null)?.forEach((row) => {
        savedRowIdsRef.current.add(row.id);
        nextCalendarNames[row.shift_date] = [
          ...(nextCalendarNames[row.shift_date] ?? []),
          row.name,
        ];
      });

      setCalendarNames((current) => ({
        ...current,
        ...nextCalendarNames,
      }));
      setIsLoadingNames(false);
    };

    loadWeekNames();
  }, [weekDays]);

  useEffect(() => {
    const channel = supabase
      .channel("bacari-shift-trader-names")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bacari_shift_trader_names",
        },
        (payload) => {
          const row = payload.new as ShiftTraderNameRow;

          if (savedRowIdsRef.current.has(row.id)) {
            return;
          }

          savedRowIdsRef.current.add(row.id);
          setCalendarNames((current) => ({
            ...current,
            [row.shift_date]: [...(current[row.shift_date] ?? []), row.name],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addNameToDay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      return;
    }

    if (selectedDayId < todayId) {
      setErrorMessage("Past days are cleared automatically, so names can only be added to today or future days.");
      return;
    }

    setIsSavingName(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("bacari_shift_trader_names")
      .insert({
        shift_date: selectedDayId,
        name: trimmedName,
      })
      .select("id, shift_date, name, created_at")
      .single();

    if (error) {
      console.error(error);
      setErrorMessage(`Could not save that name to the database: ${error.message}`);
      setIsSavingName(false);
      return;
    }

    const insertedRow = data as ShiftTraderNameRow;

    savedRowIdsRef.current.add(insertedRow.id);
    setCalendarNames((current) => {
      const dayNames = current[insertedRow.shift_date] ?? [];

      return {
        ...current,
        [insertedRow.shift_date]: [...dayNames, insertedRow.name],
      };
    });
    setNameInput("");
    setIsSavingName(false);
  };

  const goToNextWeek = () => {
    const nextWeekDays = getWeekDays(weekOffset + 1);

    setWeekOffset((current) => current + 1);
    setSelectedDayId(nextWeekDays[0].id);
  };

  const goToPreviousWeek = () => {
    if (weekOffset === 0) {
      return;
    }

    const previousWeekDays = getWeekDays(weekOffset - 1);

    setWeekOffset((current) => Math.max(0, current - 1));
    setSelectedDayId(previousWeekDays[0].id);
  };

  return (
    <main className="shift-trader-page">
      <section className="shift-trader-shell">
        <div className="shift-trader-header">
          <div>
            <p className="shift-trader-kicker">
              Bacari Shift Trader
            </p>
            <h1 className="shift-trader-title">
              Weekly calendar
            </h1>
          </div>
          <div className="shift-trader-stats">
            <div className="shift-trader-stat">
              <span>{totalNames}</span>
              Names posted
            </div>
            <div className="shift-trader-stat">
              <span>{selectedDay.shortName}</span>
              Selected day
            </div>
          </div>
        </div>

        <div className="shift-trader-layout">
          <div className="shift-trader-calendar-wrap">
            <button
              type="button"
              onClick={goToPreviousWeek}
              disabled={weekOffset === 0}
              aria-label="Move back one week"
              title={weekOffset === 0 ? "Current week" : "Previous week"}
              className="shift-trader-arrow"
            >
              &larr;
            </button>

            <section className="shift-trader-calendar">
              {weekDays.map((day) => {
                const names = calendarNames[day.id] ?? [];
                const isSelected = day.id === selectedDayId;
                const isPastDay = day.id < todayId;

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`shift-trader-day ${
                      isPastDay
                        ? "shift-trader-day-past"
                        : isSelected
                        ? "shift-trader-day-selected"
                        : ""
                    }`}
                  >
                    <span className="shift-trader-day-name">
                      {day.shortName}
                    </span>
                    <span className="shift-trader-day-date">{day.dateLabel}</span>
                    <span className="shift-trader-day-count">
                      {isPastDay
                        ? "Closed"
                        : `${names.length} ${names.length === 1 ? "name" : "names"}`}
                    </span>

                    <div className="shift-trader-name-list">
                      {names.length > 0 ? (
                        names.map((name, index) => (
                          <span
                            key={`${day.id}-${name}-${index}`}
                            className="shift-trader-name-chip"
                          >
                            {index + 1}. {name}
                          </span>
                        ))
                      ) : (
                        <span className="shift-trader-empty">
                          {isPastDay
                            ? "Previous day cleared"
                            : isLoadingNames
                            ? "Loading names..."
                            : "Click to add the first name"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </section>

            <button
              type="button"
              onClick={goToNextWeek}
              aria-label="Move forward one week"
              title="Next week"
              className="shift-trader-arrow"
            >
              &rarr;
            </button>
          </div>

          <aside className="shift-trader-entry">
            <p className="shift-trader-entry-kicker">
              Add to {selectedDay.label}
            </p>
            <h2>{selectedDay.dateLabel}</h2>

            <form onSubmit={addNameToDay} className="shift-trader-form">
              <label>
                Name
                <input
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Enter name"
                />
              </label>

              <button
                type="submit"
                disabled={isSavingName || selectedDayId < todayId}
              >
                {selectedDayId < todayId
                  ? "Past Day Closed"
                  : isSavingName
                  ? "Saving..."
                  : "Add Name"}
              </button>
            </form>

            {errorMessage && (
              <p className="shift-trader-error">
                {errorMessage}
              </p>
            )}

            <div className="shift-trader-note">
              <p>
                Names appear top to bottom in the order they were added.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default BacariShiftTrader;
