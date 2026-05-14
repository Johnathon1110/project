import { Routes } from '@angular/router';
import { Landing } from './features/public/landing/landing';
import { Login } from './features/public/login/login';
import { Register } from './features/public/register/register';

import { Dashboard as WorkerDashboard } from './features/worker/dashboard/dashboard';
import { Tasks } from './features/worker/tasks/tasks';
import { TaskDetails } from './features/worker/task-details/task-details';
import { Applications } from './features/worker/applications/applications';
import { Profile } from './features/worker/profile/profile';
import { RecommendedTasks } from './features/worker/recommended-tasks/recommended-tasks';
import { TaskDetails as OwnerTaskDetails } from './features/worker/task-details/task-details';

import { OwnerDashboard } from './features/owner/dashboard/dashboard';
import { PostTask } from './features/owner/post-task/post-task';
import { MyTasks } from './features/owner/my-tasks/my-tasks';
import { Applicants } from './features/owner/applicants/applicants';
import { RecommendedWorkers } from './features/owner/recommended-workers/recommended-workers';
import { WorkerProfile } from './features/owner/worker-profile/worker-profile';

import { Chat } from './shared/chat/chat';
import { Notifications } from './shared/notifications/notifications';
import { QuickAccess } from './features/public/quick-access/quick-access';

// Guards
import { authGuard } from './guards/auth.guard';
import { workerGuard } from './guards/worker.guard';
import { ownerGuard } from './guards/owner.guard';
import { adminGuard } from './guards/admin.guard';

import { Dashboard as AdminDashboard } from './features/admin/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'quick-access', component: QuickAccess },

  // Admin Routes
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [authGuard, adminGuard] },

  // Worker Routes
  { path: 'worker/dashboard', component: WorkerDashboard, canActivate: [authGuard, workerGuard] },
  { path: 'worker/tasks', component: Tasks, canActivate: [authGuard, workerGuard] },
  { path: 'worker/task-details/:id', component: TaskDetails, canActivate: [authGuard, workerGuard] },
  { path: 'worker/applications', component: Applications, canActivate: [authGuard, workerGuard] },
  { path: 'worker/profile', component: Profile, canActivate: [authGuard, workerGuard] },
  { path: 'worker/recommended', component: RecommendedTasks, canActivate: [authGuard, workerGuard] },

  // Owner Routes
  { path: 'owner/dashboard', component: OwnerDashboard, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/post-task', component: PostTask, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/my-tasks', component: MyTasks, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/applicants/:taskId', component: Applicants, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/recommended-workers/:taskId', component: RecommendedWorkers, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/worker-profile/:workerId', component: WorkerProfile, canActivate: [authGuard, ownerGuard] },
  { path: 'owner/task-details/:id', component: OwnerTaskDetails, canActivate: [authGuard, ownerGuard] },

  // Shared Routes
  { path: 'chat', component: Chat, canActivate: [authGuard] },
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },

  // Fallback
  { path: '**', redirectTo: '' }
];
