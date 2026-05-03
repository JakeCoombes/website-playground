import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";

type User = {
  id: number;
  email: string;
  username: string;
};

const startingUsers: User[] = [
  { id: 1, email: "jake@aol.com", username: "jake" },
  { id: 2, email: "sid@aol.com", username: "sid" },
  { id: 3, email: "conner@aol.com", username: "conner" },
];

const apiUrl = "http://localhost:1337/user";

function UserManagment() {
  const [users, setUsers] = useState<User[]>(startingUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("Jwcoombes1@gmail.com");
  const [username, setUsername] = useState("asdfasdfasdf");
  const selectedUserRef = useRef<HTMLDivElement | null>(null);

  const getUsers = async () => {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Could not load users");
      }

      const data = (await response.json()) as User[];
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUsers();
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

  const createUser = async () => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedUsername) {
      return;
    }

    const newUser = {
      id: Date.now(),
      email: trimmedEmail,
      username: trimmedUsername,
    };

    try {
      setIsLoading(true);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          username: trimmedUsername,
          password: "PASSWORD",
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create user");
      }

      await response.json();
      await getUsers();
    } catch (error) {
      console.error(error);
      setUsers((currentUsers) => [...currentUsers, newUser]);
      setSelectedUser(newUser);
    } finally {
      setIsLoading(false);
      setEmail("");
      setUsername("");
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${apiUrl}/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete user");
      }

      await response.json();
      await getUsers();
    } catch (error) {
      console.error(error);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
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
      <p className="text-center text-2xl">Currently viewing: userManagement</p>

      {selectedUser && (
        <section
          ref={selectedUserRef}
          className="mx-auto mt-6 w-full max-w-md border border-slate-700 bg-[#262626] p-5 text-center shadow-lg"
        >
          <h2 className="text-2xl font-bold text-[#a9caa8]">
            Selected User: {selectedUser.id}
          </h2>

          <div className="mt-4 space-y-2 text-lg">
            <p>
              <span className="font-semibold text-slate-300">Email:</span>{" "}
              {selectedUser.email}
            </p>
            <p>
              <span className="font-semibold text-slate-300">Username:</span>{" "}
              {selectedUser.username}
            </p>
          </div>

          <button
            type="button"
            onClick={() => deleteUser(selectedUser.id)}
            className="mt-5 h-10 rounded-full border border-red-500 bg-black px-6 text-sm font-extrabold text-red-200 transition hover:bg-red-600 hover:text-white"
          >
            Delete User
          </button>
        </section>
      )}

      <section className="mx-auto mt-36 flex max-w-5xl flex-col items-center">
        <h1 className="text-center text-5xl font-extrabold leading-tight md:text-6xl">
          User <span className="text-[#a9caa8]">Management</span>
        </h1>

        <h2 className="mt-5 text-center text-4xl font-light">Users</h2>

        <div className="mt-9 flex w-full flex-col items-center gap-6 text-base font-semibold">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={(event) => handleUserClick(event, user)}
              className={`rounded-lg border px-5 py-2 transition hover:bg-[#a9caa8] hover:text-[#202020] focus:outline-none focus:ring-2 focus:ring-[#36d264] ${
                selectedUser?.id === user.id
                  ? "border-[#36d264] text-[#a9caa8]"
                  : "border-transparent"
              }`}
            >
              {user.email}: {user.username}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-9 grid w-full max-w-4xl grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            aria-label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 min-w-0 bg-slate-700 px-3 text-lg font-semibold text-white outline-none focus:ring-2 focus:ring-[#36d264]"
            placeholder="Email"
            type="email"
          />

          <input
            aria-label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-10 min-w-0 bg-zinc-700 px-3 text-lg font-semibold text-white outline-none focus:ring-2 focus:ring-[#36d264]"
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
      </section>
    </main>
  );
}

export default UserManagment;
