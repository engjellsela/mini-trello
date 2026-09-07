import { useState, useEffect } from "react";
import { supabase } from "~/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "~/components/ui/dialog";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type DashboardProps = {
    user: User;
};

type Project = {
    id: string;
    name: string;
    userID: string;
    created_at: string;
};

type ProjectInvite = {
    id: string;
    projectID: string;
    userID: string;
    status: string;
    projectName: string;
    created_at: string;
};

export function Dashboard({user}: DashboardProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectInvites, setProjectInvites] = useState<ProjectInvite[]>([]);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const getProjects = async () => {
            const { data, error } = await supabase
            .from('projects')
            .select('*')
            if (error) console.log(error)
            else setProjects(data);
        };
       
        const getProjectInvites = async () => {
            const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('status', 'pending')
            if (error) console.log(error)
            else setProjectInvites(data);
        };
        
        getProjects();
        getProjectInvites();
        setLoading(false);
    }, []);
    
    const createProject = async () => {
        const { data, error } = await supabase
        .from('projects')
        .insert({ name: projectName, userID: user.id })
        .select()
        .single()
        if (error) alert(error.message)
        else navigate(`/project/${data?.id}`)
    };

    const acceptInvite = async (projectID: string) => {
        const { data, error } = await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', projectID)
        .select()
        if (error) alert(error.message)
        else navigate(`/project/${projectID}`)
    };

    const declineInvite = async (id: string) => {
        const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)
        if (error) alert(error.message)
        else setProjectInvites((current) => current.filter((invite) => invite.id !== id))
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) alert(error.message)
        else navigate('/login')
    };

    if (loading) return <p>Loading...</p>

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-5 bg-black text-white flex justify-between">
                <p>Dashboard Page</p>
                <Button onClick={logout} variant="destructive">Log out</Button>
            </div>

            <div className="flex-row bg-gray-400 p-2">
                <Dialog>
                    <DialogTrigger render={<Button size="lg">New project</Button>} />
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Project name</DialogTitle>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor="name-1">Name</Label>
                                <Input name="name" placeholder="Project name" onChange={(e) => setProjectName(e.target.value)} />
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline">Cancel</Button>} />
                            <Button type="submit" onClick={createProject}>Submit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="my-5">
                {projectInvites.length > 0 && (
                    <div className="m-4">
                        <p className="font-semibold uppercase">project invites</p>

                        {projectInvites.map((invite) => (
                            <div key={invite.id} className="bg-white border p-5 my-5">
                                <p>Project name: {invite.projectName}</p>
                                <Button onClick={() => acceptInvite(invite.id)}>Accept</Button>
                                <Button onClick={() => declineInvite(invite.id)}>Decline</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="m-4">
                <p className="font-semibold uppercase">your workspace</p>
                {projects?.map(project => {
                    return (
                        <Link to={`/project/${project.id}`}>
                            <div className="bg-white border p-5 my-5 hover:bg-gray-50 hover:border-black">
                                <p className="font-medium">{project.name}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};
