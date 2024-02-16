'use client';
import { useRouter } from 'next/navigation';
import { UserGroupIcon, HomeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';

// Asegúrate de definir los enlaces con su respectiva iconografía, nombre y destino (href).
const links = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Documents', href: '/documents', icon: DocumentDuplicateIcon },
];

export default function NavLinks() {
  // Uso de useRouter para obtener el pathname actual
  const { pathname } = useRouter();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon; // Asigna el ícono basado en el objeto de enlace actual.
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
            <LinkIcon className="w-6" /> {/* Ícono del enlace */}
            <p className="hidden md:block">{link.name}</p> {/* Nombre del enlace visible solo en pantallas medianas y grandes */}
          </Link>
        );
      })}
    </>
  );
}
