import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { House, SparklesIcon, Upload } from 'lucide-react';

// This is sample data.
const data = {
  settingsData: [
    {
      title: 'Settings',
      items: [
        { title: 'Profile' },
        { title: 'Account' },
        { title: 'Plan' },
        { title: 'Billing' },
        { title: 'Preferences' },
        { title: 'Notifications' }
      ]
    }
  ],
  navMain: [
    { icon: <House />, title: 'Home', path: '/home' },
    { icon: <SparklesIcon />, title: 'Ask AI', path: '/ask-ai' },     
    { icon: <Upload />, title: 'Upload CV', path: '/resume' }
    // { title: 'Trash', path: 'trash' }
  ]
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {


  return (
    <>
      <Sidebar className="h-screen" {...props}>
        <SidebarHeader>
        </SidebarHeader>
        <SidebarContent className="flex justify-between">
          {/* We create a collapsible SidebarGroup for each parent. */}
          <div className="flex flex-col gap-3">
            {data.navMain.map(item => (
              <Link key={item.title} href={`${item.path}`}>
                <Button
                  title={item.title}
                  className="cursor-pointer mx-auto w-[250px] bg-transparent shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <span className='gap-2'>
                        {item.icon}
                        {item.title}
                        {''}
                      </span>
                    </SidebarGroupLabel>
                  </SidebarGroup>
                </Button>
              </Link>
            ))}
          </div>
          <div className='border-t-2 h-full font-light'>
            <h1 className='text-left p-2 font-medium'>History
              </h1>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  );
}