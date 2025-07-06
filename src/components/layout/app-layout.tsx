"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dumbbell,
  LayoutDashboard,
  Repeat,
  History,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const navItems = [
  { href: "/", label: "Панель", icon: LayoutDashboard },
  { href: "/workouts", label: "Тренировки", icon: Repeat },
  { href: "/exercises", label: "Упражнения", icon: Dumbbell },
  { href: "/history", label: "История", icon: History },
  { href: "/ai-suggester", label: "AI-ассистент", icon: Sparkles },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const currentItem = navItems.find((item) => {
      if (item.href === '/') return pathname === '/';
      return pathname.startsWith(item.href)
    });
    if (currentItem) return currentItem.label;
    if (pathname.startsWith('/workouts/')) return 'Плеер тренировки';
    return "Мои Тренировки";
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">Мои Тренировки</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
              <AvatarFallback>П</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Пользователь</span>
              <span className="text-xs text-muted-foreground">user@email.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold font-headline">{getPageTitle()}</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
