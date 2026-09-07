import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldLabel, } from "~/components/ui/field"
import { Link } from "react-router";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const loginUser = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (error) alert(error.message)
        else navigate('/')
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="flex flex-col border p-10 w-lg bg-white">
                <p className="text-lg font-semibold mb-4">Login</p>

                <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                </Field>

                <Field className="my-4">
                    <FieldLabel>Password</FieldLabel>
                    <Input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                </Field>

                <Button size="lg" onClick={loginUser}>Login</Button>
                <Link to={'/signup'} className="text-sm mt-5 hover:text-blue-800">Don't have an account? Sign up</Link>
            </div>
        </div>
    );
};
