"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/common/auth-provider";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_ROUTES, ADMIN_ROUTES } from "@/config/routes";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: PUBLIC_ROUTES.ABOUT, label: "About" },
    { href: PUBLIC_ROUTES.FEATURES, label: "Features" },
    { href: PUBLIC_ROUTES.MARKETPLACE, label: "Marketplace" },
    { href: PUBLIC_ROUTES.PRICING, label: "Pricing" },
    { href: PUBLIC_ROUTES.CONTACT, label: "Contact" },
  ];

  const adminLinks = [
    { href: ADMIN_ROUTES.COMPONENTS, label: "Components" },
    { href: ADMIN_ROUTES.SCRAPE, label: "Scrape Pages" },
    { href: ADMIN_ROUTES.PAGES, label: "View All Pages" },
    { href: ADMIN_ROUTES.MIX_MASTER, label: "Mix Master" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            data-cursor="hover"
          >
            Prompts4u
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary relative group"
                data-cursor="link"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-primary"
                      data-cursor="hover"
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Admin Panel
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminLinks.map((link) => (
                      <DropdownMenuItem
                        key={link.href}
                        onClick={() => router.push(link.href)}
                        className="gap-2 cursor-pointer"
                      >
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                onClick={() => router.push(PUBLIC_ROUTES.DASHBOARD)}
                className="gap-2"
                data-cursor="link"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full border border-primary/20 hover:border-primary transition-colors"
                    data-cursor="hover"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(PUBLIC_ROUTES.DASHBOARD)}
                    className="gap-2 cursor-pointer"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(PUBLIC_ROUTES.MARKETPLACE)}
                    className="gap-2 cursor-pointer"
                  >
                    Marketplace
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push(PUBLIC_ROUTES.HOME);
                    }}
                    className="gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push(PUBLIC_ROUTES.LOGIN)}
                data-cursor="link"
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push(PUBLIC_ROUTES.MARKETPLACE)}
                className="gap-2"
                data-cursor="hover"
              >
                Browse
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground"
                data-cursor="hover"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] p-0 sm:max-w-[300px]"
            >
              <div className="flex flex-col h-[100dvh]">
                <div className="p-6 border-b flex-shrink-0">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="font-bold text-xl">Prompts4U</span>
                  </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-6 space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <div className="pt-4 mt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-3">
                        Admin Panel
                      </p>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </nav>
                <div className="p-6 border-t space-y-3 flex-shrink-0 bg-background">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.avatar || ""}
                            alt={user?.name || ""}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.name?.charAt(0) ||
                              user?.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(PUBLIC_ROUTES.DASHBOARD);
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                          router.push(PUBLIC_ROUTES.HOME);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(PUBLIC_ROUTES.LOGIN);
                        }}
                      >
                        <User className="h-4 w-4" />
                        Log in
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(PUBLIC_ROUTES.MARKETPLACE);
                        }}
                      >
                        Browse Marketplace
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
