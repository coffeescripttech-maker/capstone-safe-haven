"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ProtectedComponent } from "../components/common/ProtectedComponent";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  Bell,
  BarChart3,
  Activity,
  Zap,
  Cloud,
  MessageSquare,
  FileCheck,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import SidebarWidget from "./SidebarWidget";
import AppLogo from "@/components/common/AppLogo";
import { Role } from "@/types/safehaven";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; badge?: string }[];
  requiredRoles?: Role[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/dashboard"
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    name: "Alerts & SOS",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer'],
    subItems: [
      { name: "Emergency Alerts", path: "/emergency-alerts" },
      { name: "SOS Alerts", path: "/sos-alerts" },
      { name: "Alert Automation", path: "/alert-automation" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Incidents",
    path: "/incidents",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer'],
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    name: "Evacuation",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo', 'lgu_officer'],
    subItems: [
      { name: "Centers", path: "/evacuation-centers" },
      { name: "Reservations", path: "/evacuation-centers/reservations" },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "People",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo'],
    subItems: [
      { name: "Users", path: "/users" },
      { name: "Emergency Contacts", path: "/emergency-contacts" },
    ],
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    name: "SMS Blast",
    path: "/sms-blast",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer'],
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    name: "Weather",
    path: "/weather-forecast",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo'],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    name: "Reports",
    requiredRoles: ['super_admin', 'admin', 'mdrrmo'],
    subItems: [
      { name: "Analytics", path: "/analytics" },
      { name: "Monitoring", path: "/monitoring" },
      { name: "Audit Logs", path: "/audit-logs" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (navItems: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => {
        const menuContent = (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group ${
                  openSubmenu === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`${
                    openSubmenu === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text flex-1 text-left">{nav.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openSubmenu === index
                          ? "rotate-180 text-white"
                          : "text-white/70"
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
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
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[index] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu === index
                      ? `${subMenuHeight[index]}px`
                      : "0px",
                }}
              >
                <ul className="mt-1.5 space-y-0.5 ml-9 pl-3 border-l-2 border-white/10">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <span className="flex-1">{subItem.name}</span>
                        {subItem.badge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isActive(subItem.path)
                                ? "bg-brand-100 text-brand-700"
                                : "bg-white/20 text-white/90"
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );

        if (nav.requiredRoles) {
          return (
            <ProtectedComponent key={nav.name} requiredRole={nav.requiredRoles}>
              {menuContent}
            </ProtectedComponent>
          );
        }

        return menuContent;
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      if (subMenuRefs.current[openSubmenu]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800 dark:from-brand-800 dark:via-brand-900 dark:to-gray-950 border-r border-brand-700/50 dark:border-brand-900/50 text-white h-screen transition-all duration-300 ease-in-out z-50 shadow-xl
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
      <div className="py-8 flex items-center justify-center border-b border-white/10">
        {isExpanded || isHovered || isMobileOpen ? (
          <AppLogo variant="full" href="/" />
        ) : (
          <AppLogo variant="icon" href="/" />
        )}
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar py-6">
        <nav className="mb-6 px-1">
          <h2
            className={`mb-3 text-xs uppercase flex leading-[20px] text-white/50 font-semibold tracking-wider ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "justify-start"
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Navigation"
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </h2>
          {renderMenuItems(navItems)}
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
