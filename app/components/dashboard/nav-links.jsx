'use client';
import { useRouter } from 'next/navigation';
import { UserGroupIcon, HomeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Bots', href: '/dashboard/bots', icon: UserGroupIcon },
  { name: 'conversations', href: '/dashboard/conversations', icon: DocumentDuplicateIcon },
];

export default function NavLinks() {
  
  const { pathname } = useRouter();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon; 
        return (
          <Link
            key={link.name} // Usa el nombre como clave única para cada enlace.
            href={link.href} // Dirección URL a la que el enlace apuntará.
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-50 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" /> 
            <p className="hidden md:block">{link.name}</p> 
          </Link>
        );
      })}
    </>
  );
}
