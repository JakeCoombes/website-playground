import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type User = {
  id: number;
  email: string;
  username: string;
};

function UserManagment() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const selectedUserRef = useRef<HTMLDivElement | null>(null);

  const getUsers = async () => {
    const { data, error } = await supabase
      .from("app_users")
      .select("id, email, username")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setErrorMessage("Could not load users from Supabase.");
      return;
    }

    setUsers(data ?? []);
    setErrorMessage("");
  };

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setIsAuthLoading(false);

      if (currentSession) {
        await getUsers();
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSelectedUser(null);

      if (nextSession) {
        getUsers();
      } else {
        setUsers([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedUserRef.current &&
        !selectedUserRef.current.contains(event.target as Node)
      ) {
        setSelectedUser(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createUser();
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsAuthLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;
      setSession(data.session);
      setLoginPassword("");

      if (data.session) {
        await getUsers();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not sign in. Check your email and password.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage("");
    await supabase.auth.signOut();
  };

  const createUser = async () => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedUsername) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await supabase.from("app_users").insert({
        email: trimmedEmail,
        username: trimmedUsername,
      });

      if (error) throw error;
      await getUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not create user in Supabase.");
    } finally {
      setIsLoading(false);
      setEmail("");
      setUsername("");
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      setErrorMessage("");

      const { error } = await supabase.from("app_users").delete().eq("id", userId);

      if (error) throw error;
      await getUsers();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete user from Supabase.");
    } finally {
      setSelectedUser(null);
    }
  };

  const handleUserClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    user: User,
  ) => {
    event.stopPropagation();
    setSelectedUser(user);
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#202020] px-5 py-12 text-white">
      {/* <p className="text-center text-2xl">Currently viewing: userManagement</p> */}

      {errorMessage && (
        <p className="mx-auto mt-4 max-w-xl rounded-md border border-red-500 bg-red-950 px-4 py-3 text-center text-sm text-red-100">
          {errorMessage}
        </p>
      )}

      {!session && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-2xl"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <form
            onSubmit={handleSignIn}
            className="grid w-full max-w-md grid-cols-1 gap-3 rounded-lg border border-slate-700 bg-black p-6 text-center shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-[#a9caa8]">
              Admin Login
            </h2>

            {errorMessage && (
              <p className="rounded-md border border-red-500 bg-red-950 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            )}

            {isAuthLoading ? (
              <p className="text-slate-300">Checking admin session...</p>
            ) : (
              <>
                <input
                  aria-label="Admin email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="user-management-input h-10 min-w-0 rounded-full border-2 border-blue-600 bg-grey-900 px-3 text-lg font-semibold text-white caret-white outline-none placeholder:text-slate-300 focus:border-[#36d264] focus:ring-2 focus:ring-[#36d264]"
                  placeholder="Email"
                  type="email"
                />

                <input
                  aria-label="Admin password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className="user-management-input h-10 min-w-0 rounded-full border-2 border-blue-600 bg-grey-900 px-3 text-lg font-semibold text-white caret-white outline-none placeholder:text-slate-300 focus:border-[#36d264] focus:ring-2 focus:ring-[#36d264]"
                  placeholder="Password"
                  type="password"
                />

                <button
                  type="submit"
                  className="h-10 min-w-32 rounded-full border border-[#00862f] bg-black px-6 text-sm font-extrabold text-zinc-400 transition hover:border-[#36d264] hover:text-white"
                >
                  SIGN IN
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-2xl"
          style={{
            backdropFilter: "blur(4px)",
          }}
          onMouseDown={() => setSelectedUser(null)}
        >
          <section
            ref={selectedUserRef}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-slate-700 bg-black p-5 text-center shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-[#a9caa8]">
              Selected User: {selectedUser.id}
            </h2>

            <div
              className="mx-auto mt-4 grid w-full max-w-sm gap-x-4 gap-y-2 text-lg"
              style={{ gridTemplateColumns: "1fr 2fr" }}
            >
              <span className="text-right font-semibold text-slate-300">
                Email:
              </span>
              <span className="min-w-0 text-left break-words">
                {selectedUser.email}
              </span>

              <span className="text-right font-semibold text-slate-300">
                Username:
              </span>
              <span className="min-w-0 text-left break-words">
                {selectedUser.username}
              </span>
            </div>

            <button
              type="button"
              onClick={() => deleteUser(selectedUser.id)}
              className="mt-5 h-10 rounded-full border border-red-500 bg-black px-6 text-sm font-extrabold text-red-200 transition hover:bg-red-600 hover:text-white"
            >
              Delete User
            </button>
          </section>
        </div>
      )}

      <section className="mx-auto mt-12 flex max-w-5xl flex-col items-center ">
        <h1 className="text-center text-5xl font-extrabold leading-tight md:text-6xl">
          User <span className="text-[#a9caa8]">Management</span>
        </h1>

        {session && (
          <div className="mt-5 flex flex-col items-center gap-3 text-sm text-slate-300 sm:flex-row">
            <span>Signed in as {session.user.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:border-red-500 hover:text-red-200"
            >
              Sign Out
            </button>
          </div>
        )}

        {session && (
          <>
            <form
              onSubmit={handleSubmit}
              className="mt-9 grid w-full max-w-4xl grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                aria-label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="user-management-input h-10 min-w-0 border-2 rounded-full border-blue-600 bg-grey-900 px-3 text-lg font-semibold text-white caret-white outline-none placeholder:text-slate-300 focus:border-[#36d264] focus:ring-2 focus:ring-[#36d264]"
                placeholder="Email"
                type="email"
              />

              <input
                aria-label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="user-management-input h-10 min-w-0 border-2 rounded-full border-blue-600 bg-grey-900 px-3 text-lg font-semibold text-white caret-white outline-none placeholder:text-slate-300 focus:border-[#36d264] focus:ring-2 focus:ring-[#36d264]"
                placeholder="Username"
                type="text"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="h-10 min-w-32 rounded-full border border-[#00862f] bg-black px-6 text-sm font-extrabold text-zinc-400 transition hover:border-[#36d264] hover:text-white"
              >
                {isLoading ? "LOADING..." : "ADD USER"}
              </button>
            </form>
            
            <hr className="mt-20 mb-20 w-full border-t border-slate-700" />

            <h2 className="text-center text-4xl font-light">Users</h2>

            <div className="mt-9 flex w-1/2 flex-col items-stretch gap-6 rounded-lg border border-slate-700 px-6 py-6 text-base font-semibold">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={(event) => handleUserClick(event, user)}
                  className={`w-full rounded-lg border px-5 py-2 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#36d264] ${
                    selectedUser?.id === user.id
                      ? "border-[#36d264] text-[#a9caa8]"
                      : "border-transparent"
                  }`}
                >
                  {user.email} | {user.username}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default UserManagment;
