import { useState, useEffect } from "react";
import { supabase } from "~/supabaseClient";
import type { User } from "@supabase/supabase-js";

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

    return (
        <div>
            <p>Dashboard Page</p>

            <button onClick={createProject}>New project</button>

            <div className="my-5">
                <p>Your project invites: </p>
                {projectInvites.map(invite => {
                    return (
                        <div className="my-2 bg-blue-100">
                            <p>Project name: {invite.projects?.name}</p>
                            <button onClick={() => acceptProjectInvite(invite.id)}>Accept</button>
                        </div>
                    )
                })}
            </div>

            <div>
                <p>YOUR WORKSPACES</p>
                {projects?.map(project => {
                    return (
                        <div className="bg-gray-200 p-2">
                            <p>Project name: {project.name}</p>
                            <p>project id: {project.id}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};