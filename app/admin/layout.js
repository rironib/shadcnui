import {siteConfig} from "@/config/siteConfig";
import {AppSidebar} from "@/components/admin/app-sidebar";
import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar";

const Layout = ({children}) => {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;