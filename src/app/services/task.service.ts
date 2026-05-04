import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksKey = 'smarttask_tasks';

  private tasks: Task[] = [
    {
      id: 1,
      title: 'Delivery Helper Needed',
      description: 'Need a worker to help with local deliveries for one day.',
      category: 'Delivery',
      type: 'physical',
      location: 'Cairo',
      budget: 200,
      date: '2026-04-15',
      ownerId: 2,
      requiredSkills: ['Driving', 'Time Management'],
      status: 'open'
    },
    {
      id: 2,
      title: 'Home Cleaning Task',
      description: 'Looking for someone to clean a small apartment.',
      category: 'Cleaning',
      type: 'physical',
      location: 'Giza',
      budget: 150,
      date: '2026-04-16',
      ownerId: 2,
      requiredSkills: ['Cleaning', 'Attention to Detail'],
      status: 'open'
    },
    {
      id: 3,
      title: 'Simple Logo Design',
      description: 'Need a basic logo for a small online shop.',
      category: 'Design',
      type: 'remote',
      location: 'Remote',
      budget: 300,
      date: '2026-04-18',
      ownerId: 2,
      requiredSkills: ['Photoshop', 'Creativity'],
      status: 'open'
    }
  ];

  constructor() {
    const savedTasks = localStorage.getItem(this.tasksKey);

    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    } else {
      localStorage.setItem(this.tasksKey, JSON.stringify(this.tasks));
    }
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  getTasksByOwnerId(ownerId: number): Task[] {
    return this.tasks.filter(task => task.ownerId === ownerId);
  }

  addTask(taskData: Omit<Task, 'id'>): { success: boolean; message: string } {
    const newTask: Task = {
      id: this.tasks.length + 1,
      ...taskData
    };

    this.tasks.push(newTask);
    localStorage.setItem(this.tasksKey, JSON.stringify(this.tasks));

    return { success: true, message: 'Task created successfully' };
  }

  getRecommendedTasks(userSkills: string[]): any[] {
  return this.tasks
    .map(task => {
      const matchedSkills = task.requiredSkills.filter(skill =>
        userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
      );

      const score = task.requiredSkills.length > 0
        ? Math.round((matchedSkills.length / task.requiredSkills.length) * 100)
        : 0;

      return {
        ...task,
        matchScore: score,
        matchedSkills
      };
    })
    .filter(task => task.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

getRecommendedWorkers(task: any, workers: any[]): any[] {
  return workers
    .map(worker => {
      const workerSkills = worker.skills || [];

      const matchedSkills = task.requiredSkills.filter((skill: string) =>
        workerSkills.some((ws: string) => ws.toLowerCase() === skill.toLowerCase())
      );

      const score = task.requiredSkills.length > 0
        ? Math.round((matchedSkills.length / task.requiredSkills.length) * 100)
        : 0;

      return {
        ...worker,
        matchScore: score,
        matchedSkills
      };
    })
    .filter(worker => worker.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

updateTaskStatus(taskId: number, status: 'open' | 'in-progress' | 'completed'): void {
  const task = this.tasks.find(t => t.id === taskId);

  if (task) {
    task.status = status;
    localStorage.setItem(this.tasksKey, JSON.stringify(this.tasks));
  }
}


}
