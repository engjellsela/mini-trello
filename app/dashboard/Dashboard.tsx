import { useState, useEffect } from "react";
import { supabase } from "~/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

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
    projects: Project | null;
    created_at: string;
};

export function Dashboard({user}: DashboardProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectInvites, setProjectInvites] = useState<ProjectInvite[]>([]);
    const [loading, setLoading] = useState(true);

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
            .select(`*,
                projects (
                    name
                )    
            `)
            .eq('status', 'pending')
            if (error) console.log(error)
            else setProjectInvites(data)
        };
        
        getProjects();
        getProjectInvites();
        setLoading(false);
    }, []);
    
    const createProject = async () => {
        const { data, error } = await supabase
        .from('projects')
        .insert({ name: 'to-do list', userID: user.id })
        if (error) console.log(error)
    };

    const acceptProjectInvite = async (projectID: string) => {
        const { data, error } = await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', projectID)
        .select()
        if (error) console.log(error)
        else console.log(data)
    };

    if (loading) return <p>Loading...</p>

    console.log(projectInvites)

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-5 bg-black text-white">
                <p>Dashboard Page</p>
            </div>

            <div className="flex-row bg-gray-400 p-2">
                <Button size="lg" onClick={createProject}>New project</Button>
            </div>


            <div className="my-5">
                {projectInvites.length > 0 && (
                    <div>
                        <p>Your project invites:</p>

                        {projectInvites.map((invite) => (
                            <div key={invite.id} className="my-2 bg-blue-100">
                            <p>Project name: {invite.projects?.name}</p>
                            <Button onClick={() => acceptProjectInvite(invite.id)}>Accept</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4">
                <p className="font-semibold">YOUR WORKSPACES</p>
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