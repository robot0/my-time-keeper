import React, { JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type NavigationItem = {
    name: string;
    href: string;
    current: boolean;
};

const navigation: NavigationItem[] = [
    { name: 'Daily', href: '/daily', current: true },
    { name: 'Weekly', href: '/weekly', current: false },
    { name: 'Monthly', href: '/monthly', current: false },
    { name: 'Yearly', href: 'yearly', current: false },
];

export default function TopBar(): JSX.Element {
    return (
        <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-gray-200 lg:px-8">
                <div className="relative flex h-16 justify-between">
                    {/* Logo section */}
                    <div className="relative z-10 flex px-2 lg:px-0">
                        <div className="flex flex-shrink-0 items-center">
                            <Image
                                className="block h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                alt="Your Company"
                                width={32}
                                height={32}
                            />
                        </div>
                    </div>

                    {/* Search section */}
                    <div className="relative z-0 flex flex-1 items-center justify-center px-2 sm:absolute sm:inset-0">
                        <div className="w-full sm:max-w-xs">
                            <label htmlFor="search" className="sr-only">
                                Search
                            </label>
                            <div className="relative">
                                {/* Removed the icon; only an empty div if you still need spacing. 
                    Otherwise, you can omit this div entirely. */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" />
                                <input
                                    id="search"
                                    name="search"
                                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Search"
                                    type="search"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right section (was notification/user menu) - removed icons & user dropdown */}
                    <div className="relative z-10 flex items-center lg:hidden">
                        {/* Mobile menu toggle was here; removed Disclosure & icons */}
                    </div>
                    <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
                        {/* Notification button or user profile dropdown was here; removed */}
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className="hidden lg:flex lg:space-x-8 lg:py-2" aria-label="Global">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            aria-current={item.current ? 'page' : undefined}
                            className={`rounded-md py-2 px-3 inline-flex items-center text-sm font-medium ${item.current
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

        </header>
    );
}