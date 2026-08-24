import { supabase } from "~/supabaseClient";

export function SignUp() {
  const createUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'eengjellsela@gmail.com',
      password: '123123'
    });
    if (error) console.log('error1:', error)
    else if (data.user) {
      const { error } = await supabase
      .from('accounts')
      .insert({ id: data.user.id, email: data.user.email })
      if (error) console.log('eror2', error)
      else console.log('created acc succ')
    }
  };

  return (
    <div>
      <h1 className="font-bold text-lg">Sign Up</h1>
      <button onClick={createUser}>Sign up</button>
    </div>
  );
};