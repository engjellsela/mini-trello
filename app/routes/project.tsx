import { useEffect, useState } from "react";
import type { Route } from "./+types/project";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

type Project = {
  id: string;
  name: string;
  userID: string;
  created_at: string;
};

type Task = {
  id: string;
  name: string;
  description: string;
  status: string;
  assignedTo: string;
  projectID: string;
  created_at: string;
  accounts: {
    email: string;
  };
};

export default function Project({ params }: Route.ComponentProps) {
  const [project, setProject] = useState<Project>();
  const [tasks, setTasks] = useState<Task[]>([]);
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
    };

    const getTasks = async () => {
      const { data, error } = await supabase
      .from('tasks')
      .select('*, accounts(email)')
      .eq('projectID', params.id)
      if (error) setError(error.message)
      else setTasks(data)
      
    };

    checkProject();
    getTasks();
    setIsLoading(false);
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

  const createTask = async (name: string, description: string, status: string, assignedTo: string) => {
    const { data, error } = await supabase
    .from('tasks')
    .insert({ name: name, description: description, status: status, assignedTo: assignedTo, projectID: params.id })
    .select()
    if (error) console.log(error)
    else console.log(data)
  };

  const editTask = async (id: string, name: string, description: string, status: string) => {
    const { data, error } = await supabase
    .from('tasks')
    .update({ name: name, description: description, status: status })
    .eq('id', id)
    .select()
    if (error) console.log(error)
    else console.log(data)
  };

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Project failed to load: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-5 bg-black text-white">
        <p>{project?.name}</p>
      </div>

      <div className="flex-row bg-gray-400 p-2">
        <Button size="lg" onClick={() => editProjectName('hello world project')} className="m-2">Edit project</Button>
        <Button size="lg" onClick={() => deleteProject()} className="m-2">Delete project</Button>
        <Button size="lg" onClick={() => inviteMember('claytoncrockville@gmail.com')} className="m-2">Invite member</Button>
        <Button size="lg" onClick={() => createTask("login page", "create new login page", "In progress", "a152e53d-2a7d-4bee-bbfe-7387b3e92818")} className="m-2">Create task</Button>
      </div>

      <div className="p-4 bg-gray-100">
        {tasks.map((task) => {
          return (
              <div key={task.id} className="bg-white border p-5 my-5">
                <p>{task.name}</p>
                <p>description: {task.description}</p>
                <p>status: {task.status}</p>
                <p>Assigned to: {task.accounts?.email}</p>
                <button onClick={() => editTask(task.id, "sign up page", "this is my new sign up page", "in progress")}>Edit Task</button>
              </div>
            );
        })}
      </div>
    </div>
  );
};