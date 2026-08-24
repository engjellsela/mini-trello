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

export function Dashboard({user}: DashboardProps) {
    const [projects, setProjects] = useState<Project[]>([]);

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
            else console.log(data)
        };
        
        getProjects();
        getProjectInvites();
    }, []);
    
    const createProject = async () => {
        const { data, error } = await supabase
        .from('projects')
        .insert({ name: 'to-do list', userID: user.id })
        if (error) console.log(error)
    };

    return (
        <div>
            <p>Dashboard Page</p>

            <button onClick={() => console.log(projects)}>Get projects</button>

            <button onClick={createProject}>New project</button>
        </div>
    );
};