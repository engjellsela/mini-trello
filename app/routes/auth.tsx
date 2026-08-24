import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { supabase } from "../supabaseClient";

export default function HandleAuth() {
  const navigate = useNavigate();
  const [checkAuth, setCheckAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      }

      setCheckAuth(false);
    });
  }, [navigate]);

  if (checkAuth) return <p>Loading...</p>;

  return <Outlet />;
};