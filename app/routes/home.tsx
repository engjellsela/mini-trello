import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { supabase } from "../supabaseClient";
import type { User } from "@supabase/supabase-js";
import { SignUp } from "../auth/signup";
import { Dashboard } from "~/dashboard/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
};

export default function Home() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setUser(session.user);
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return <p>Loading ...</p>;
  };

  return user ? <Dashboard user={user} /> : <SignUp />;
};