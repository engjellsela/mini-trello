import { supabase } from "../supabaseClient";

export default function Login() {
    const loginUser = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'eengjellsela@gmail.com',
            password: '123123'
        });
        if (error) console.log(error)
        else console.log('logged in succesful: ', data);
    };

    return (
        <div>
            <button onClick={loginUser}>Login</button>
        </div>
    );
};