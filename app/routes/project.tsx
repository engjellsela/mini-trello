import { useEffect, useState } from "react";
import type { Route } from "./+types/project";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "react-router";

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

type NewTask = {
  name: string;
  description: string;
  status: string;
  assignedTo: string | null;
};

export default function Project({ params }: Route.ComponentProps) {
  const [project, setProject] = useState<Project>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState(project?.name ?? '');
  const [memberEmail, setMemberEmail] = useState('');
  const [newTask, setNewTask] = useState<NewTask>({name: '', description: '', status: '', assignedTo: ''});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

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

  useEffect(() => {
    setProjectName(project?.name ?? '');
  }, [project?.name]);

  const editProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
    .from('projects')
    .update({ name: projectName })
    .eq('id', project?.id)
    .select()
    if (error) console.log(error)
    else {
      setProject(data[0]);
      setIsEditOpen(false);
    }
  };

  const deleteProject = async () => {
    const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', project?.id)
    if (error) console.log(error)
    else navigate("/");
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
    .from('accounts')
    .select('id, email')
    .eq('email', memberEmail)
    if (error) alert(error?.message)
    
    if (!project?.id || !data?.[0]?.id) {
      alert("Missing project or account");
      setIsInviteOpen(false);
    }

    const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({ projectID: project?.id, userID: data[0]?.id })
    if (memberError) alert(memberError?.message)  
    else {
      alert("Invite sent successfully.");
      setIsInviteOpen(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
    .from('tasks')
    .insert({ projectID: project?.id, name: newTask.name, description: newTask.description, status: newTask.status, assignedTo: newTask.assignedTo === '' ? null : newTask.assignedTo })
    .select()
    .single()
    if (error) {
      alert(error.message)
      return;
    } else {
      alert("Task created succesfully.");
      setTasks((currentTasks) => [...currentTasks, data]);
      setIsNewTaskOpen(false);
    }
  };

  const editTask = async (id: string, name: string, description: string, status: string) => {
    const { data, error } = await supabase
    .from('tasks')
    .update({ name: name, description: description, status: status })
    .eq('id', id)
    .select()
    if (error) { 
      alert(error.message)
      return;
    }
    else {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? { ...task, name, description, status }
            : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .select()
    if (error) {
      alert(error.message);
      return;
    }
    else setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  };

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Project failed to load: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-5 bg-black text-white flex justify-between">
        <Link to="/"><Button variant="link" className="text-white hover:cursor-pointer">Back</Button></Link>
        <div className="flex flex-row">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger render={<Button size="lg" className="mx-2">Edit</Button>} />
              <DialogContent className="sm:max-w-sm">
                <form onSubmit={editProject}>
                  <DialogHeader>
                    <DialogTitle>{project?.name}</DialogTitle>
                    <DialogDescription>Enter new project name. Your changes will be saved when you click Save button.</DialogDescription>
                  </DialogHeader>
                  <FieldGroup>
                    <Field className="my-4">
                      <Label>Project name</Label>
                      <Input placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline">Cancel</Button>} />
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
          </Dialog>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger render={<Button size="lg" className="mx-2">Invite +</Button>} />
            <DialogContent>
            <form onSubmit={inviteMember}>
                <DialogHeader>
                  <DialogTitle>Invite member</DialogTitle>
                </DialogHeader>
                <FieldGroup>
                  <Field className="my-4">
                      <Label>Email</Label>
                      <Input placeholder="Enter member email address" onChange={(e) => setMemberEmail(e.target.value)}  />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Submit</Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>  

          <Dialog>
            <DialogTrigger render={<Button variant="destructive" className="mx-2">Delete</Button>} />
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete {project?.name}</DialogTitle>
                <DialogDescription>This Permanently delete the project and cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button variant="destructive" onClick={deleteProject}>Delete project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-between m-4">
        <p className="font-semibold mt-2 uppercase">{project?.name}</p>

        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger render={<Button size="lg" className="mx-2">New Task +</Button>} />
          <DialogContent>
            <form onSubmit={createTask}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <FieldGroup>
                <Field className="mt-2">
                  <Label>Name</Label>
                  <Input placeholder="Task name" onChange={(e) => setNewTask((task) => ({...task, name: e.target.value}))} />
                </Field>
                <Field>
                  <Label>Description</Label>
                  <Input placeholder="Task description" onChange={(e) => setNewTask((task) => ({...task, description: e.target.value}))} />
                </Field>
                <Field>
                  <Label>Status</Label>
                  <Input placeholder="Task status" onChange={(e) => setNewTask((task) => ({...task, status: e.target.value}))} />
                </Field>
                <Field>
                  <Label>Assign <span className="text-gray-400 text-normal text-sm">(optional)</span></Label>
                  <Input placeholder="Enter memeber email" onChange={(e) => setNewTask((task) => ({...task, assignedTo: e.target.value}))} />
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-2">
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="m-4">
        {tasks.map((task) => {
          return (
              <div key={task.id} className="bg-white border p-5 my-5">
                <p>{task.name}</p>
                <p>description: {task.description}</p>
                <p>status: {task.status}</p>
                <p>Assigned to: {task.accounts?.email}</p>
                <Dialog>
                  <DialogTrigger render={<Button>Edit</Button>} />
                  <DialogContent>
                    <form>
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                      </DialogHeader>
                      <FieldGroup>
                        <Field className="mt-2">
                          <Label>Name</Label>
                          <Input placeholder="Task name" />
                        </Field>
                        <Field>
                          <Label>Description</Label>
                          <Input placeholder="Task description" />
                        </Field>
                        <Field>
                          <Label>Status</Label>
                          <Input placeholder="Task status" />
                        </Field>
                      </FieldGroup>
                      <DialogFooter className="mt-2">
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit">Save</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => deleteTask(task.id)}>Delete</Button>
              </div>
            );
        })}
      </div>
    </div>
  );
};