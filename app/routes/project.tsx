import { useEffect, useState } from "react";
import type { Route } from "./+types/project";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router";

type Project = {
  id: string;
  name: string;
  userID: string;
  created_at: string;
};

export default function Project({ params }: Route.ComponentProps) {
  const [project, setProject] = useState<Project>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkProject = async () => {
      const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      if (error) setError(error.message);
      else setProject(data[0])

      setIsLoading(false);
    };

    checkProject();
  }, [params.id]);

  const editProjectName = async (name: string) => {
    const { data, error } = await supabase
    .from('projects')
    .update({ name: name })
    .eq('id', project?.id)
    .select()
    if (error) console.log(error)
    else setProject(data[0])
  };

  const deleteProject = async () => {
    const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', project?.id)
    if (error) console.log(error)
    else navigate("/");
  };

  const inviteMember = async (email: string) => {
    const { data, error } = await supabase
    .from('accounts')
    .select('id, email')
    .eq('email', email)
    if (error) alert(error?.message)
    
    if (!project?.id || !data?.[0]?.id) {
      console.log("Missing project or account");
      return;
    }

    const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({ projectID: project?.id, userID: data[0]?.id })
    if (memberError) alert(memberError?.message)  
    else alert("Invite sent successfully.")
  };

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Project failed to load: {error}</p>

  return (
    <div>
      <div>
        <h1>Project</h1>
        <p>Project ID: {project?.id}</p>
        <p>Project name: {project?.name}</p>
        <p>Created date: {project?.created_at}</p>
      </div>

      <button onClick={() => editProjectName('hello world project')}>Edit project</button>

      <br /><br />

      <button onClick={() => deleteProject()}>Delete project</button>

      <br /><br />

      <button onClick={() => inviteMember('claytoncrockville@gmail.com')}>Invite member</button>      
    </div>
  );
};