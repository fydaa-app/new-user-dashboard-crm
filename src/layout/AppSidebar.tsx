"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"; // Import useRouter for navigation
import { deleteCookie } from "cookies-next"; // Import deleteCookie to handle cookie deletion
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  PieChartIcon,
  UserCircleIcon,
  LeaderboardIcon,
  SettingIcon,
  ShoppingCartIcon,
  SipIcon,
  CrmIcon
  
} from "../icons/index";
import { useGlobalContext } from "@/context/GlobalState";
import { useRoleNameMap } from "@/context/RoleNameContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15Z" fill="#737791"/>
</svg>,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CrmIcon />,
    name: "Sales CRM",
    path: "/sales-crm",
  },
  {
    icon: <SipIcon />,  
    name: "SIP",
    path: "/sip",
  }, 
  {
    icon: <LeaderboardIcon />,
    name: "Leaderboard",
    path: "/leaderboard",
  },
  {
    icon: <ShoppingCartIcon />,
    name: "Transaction",
    path: "/transaction",
  },
  {
    icon: <ShoppingCartIcon />,
    name: "Investments",
    path: "/siptransaction",
  },
  {
    icon: <PieChartIcon />,
    name: "Portfolio",
    path: "/portfolio",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.6686 16.75C12.4526 16.75 12.2579 16.6587 12.1211 16.5126L7.5115 11.9059C7.21851 11.6131 7.21836 11.1382 7.51116 10.8452C7.80396 10.5523 8.27883 10.5521 8.57182 10.8449L11.9186 14.1896V4C11.9186 3.58579 12.2544 3.25 12.6686 3.25C13.0828 3.25 13.4186 3.58579 13.4186 4V14.1854L16.7615 10.8449C17.0545 10.5521 17.5294 10.5523 17.8222 10.8453C18.115 11.1383 18.1148 11.6131 17.8218 11.9059L13.2469 16.4776C13.1093 16.644 12.9013 16.75 12.6686 16.75ZM5.41663 16C5.41663 15.5858 5.08084 15.25 4.66663 15.25C4.25241 15.25 3.91663 15.5858 3.91663 16V18.5C3.91663 19.7426 4.92399 20.75 6.16663 20.75H19.1675C20.4101 20.75 21.4175 19.7426 21.4175 18.5V16C21.4175 15.5858 21.0817 15.25 20.6675 15.25C20.2533 15.25 19.9175 15.5858 19.9175 16V18.5C19.9175 18.9142 19.5817 19.25 19.1675 19.25H6.16663C5.75241 19.25 5.41663 18.9142 5.41663 18.5V16Z"
          fill="currentColor"
        />
      </svg>
    ),
    name: "Download AUM",
    path: "/download-aum",
  },
  {
    icon: <PieChartIcon />,
    name: "Revenue",
    path: "/revenue",
  },
  {
    icon: <PieChartIcon />,
    name: "Goals & Plans",
    path: "/goals-plans",
  },
  {
    icon: <PieChartIcon />,
    name: "Packages",
    path: "/packages",
  },
  {
    icon: <PieChartIcon />,
    name: "Redemption",
    path: "/redemption",
  },

  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/userlist",
  },
  {
    icon: <UserCircleIcon />,
    name: "Lead User List",
    path: "/leaduserlist",
  },
  {
    icon: <PieChartIcon />,
    name: "Payment Report",
    path: "/salereport",
  },
  {
    name: "Payouts",
    icon: <svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z"
    fill="#737791"
  />
</svg>,
    path: "/payouts",
  },
  {
    name: "Settings",
    icon: <SettingIcon />,
    path: "/settings",
  },
  {
    name: "Sign Out",
    icon: (
      <svg
        className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
          fill=""
        />
      </svg>
    ),
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter for navigation

  const { user, isLoading } = useAuth();
  const { appType, userAppTypeLock } = useGlobalContext();
  const { roleNameMap } = useRoleNameMap();
  const effectiveAppType = userAppTypeLock || appType;

  const userRoleLevel = user?.role ? parseInt(user.role, 10) : NaN;
  const isPartner = !isNaN(userRoleLevel) && roleNameMap[userRoleLevel]?.toLowerCase() === "partner";

  // Filter nav items based on role (same logic as designations)
  const filteredNavItems = React.useMemo(() => {
    if (isLoading) {
      return navItems; // Show all while loading
    }
    return navItems.filter((item) => {
      // Filter Payouts by role
      if (item.name === "Payouts") {
        return user?.role === '0' || isPartner;
      }
      // Filter SIP and SIP Transaction by appType
      if (["SIP", "Investments", "Portfolio", "Download AUM", "Revenue", "Goals & Plans", "Packages", "Redemption"].includes(item.name)) {
        return effectiveAppType === "Fydaa";
      }
      return true;
    });
  }, [isLoading, user?.role, isPartner, appType, userAppTypeLock]);
  

  const handleSignOut = () => {
    // Close mobile sidebar if open
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
    
    // Delete cookies
    deleteCookie("authToken");
    deleteCookie("employeeData");

    // Redirect to sign-in page
    router.push("/signin");
  };

  const handleMenuItemClick = () => {
    // Close mobile sidebar when a menu item is clicked on mobile
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };


  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => (
        <li key={nav.name}>
          {nav.name === "Sign Out" ? (
            <button
              onClick={handleSignOut}
              className="menu-item group menu-item-inactive"
            >
              <span className="menu-item-icon-inactive">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                onClick={handleMenuItemClick}
                className={`menu-item group ${
                  pathname === nav.path
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    pathname === nav.path
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-4 lg:py-8 flex">
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo2.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">{renderMenuItems(filteredNavItems)}</nav>
      </div>
    </aside>
  );
};

export default AppSidebar;