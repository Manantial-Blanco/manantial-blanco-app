'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckIcon, ClockIcon, MoreHorizontalIcon } from '@/components/icons';
import { Dictionary, Locale } from '@/types';
import { NavigationHeader } from '@/components/layout/NavigationHeader';

const summaryData = [
  { title: 'Published', value: '5', unit: 'Pieces' },
  { title: 'Registered', value: '10', unit: 'Pieces' },
  { title: 'Earned Perks', value: '130', unit: 'Pesos' },
  { title: 'Total Income', value: '$2,450', unit: 'pesos' },
];

const movementsData = [
  {
    from: 'Juan57923',
    time: '1 minute ago',
    amount: '$694.42 USD',
    status: 'pending',
  },
  {
    from: 'Fernando77',
    time: '1 minute ago',
    amount: '$694.42 USD',
    status: 'completed',
  },
  {
    from: 'Giulietta',
    time: '3 hours ago',
    amount: '$230.00 USD',
    status: 'completed',
  },
];

const piecesData = [
  {
    name: 'Alebrije Alado',
    artist: 'Leonardo Linares',
    type: 'Only piece',
    price: '$694.42 USD',
    perks: '$694.42 USD',
    status: 'pending',
  },
  {
    name: 'Alebrije Alado',
    artist: 'Leonardo Linares',
    type: 'Only piece',
    price: '$694.42 USD',
    perks: '$694.42 USD',
    status: 'completed',
  },
  {
    name: 'Alebrije Alado',
    artist: 'Leonardo Linares',
    type: 'Only piece',
    price: '$694.42 USD',
    perks: '$694.42 USD',
    status: 'completed',
  },
  {
    name: 'Alebrije Alado',
    artist: 'Leonardo Linares',
    type: 'Only piece',
    price: '$694.42 USD',
    perks: '$694.42 USD',
    status: 'completed',
  },
];

interface HomePageClientProps {
  lang: Locale;
  dict: Dictionary;
}

export default function HomePageClient({ lang, dict }: HomePageClientProps) {
  const router = useRouter();

  return (
    <>
      <NavigationHeader lang={lang} dict={dict} />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-black">Artist Panel</h2>
          <Button 
            onClick={() => router.push(`/${lang}/register-piece`)}
            className="bg-blue-900 text-white hover:bg-blue-800 rounded-full px-6 py-3"
          >
            Register Piece
          </Button>
        </div>

        <section className="mb-12">
          <h3 className="text-xl font-semibold text-black mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-black">{item.value}</p>
                <p className="text-gray-500">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-semibold text-black mb-4">Last Movements</h3>
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            {movementsData.map((movement, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-black">
                    From <span className="font-semibold">{movement.from}</span>
                  </p>
                  <p className="text-sm text-gray-500">{movement.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-black">{movement.amount}</p>
                  {movement.status === 'pending' ? (
                    <ClockIcon className="h-6 w-6 text-orange-500" />
                  ) : (
                    <CheckIcon className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-black mb-4">My Pieces</h3>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-7 items-center p-4 text-sm text-gray-500 font-semibold border-b">
              <div className="col-span-2">Piece</div>
              <div>Artist</div>
              <div>Type</div>
              <div>Price</div>
              <div>Perks</div>
              <div></div>
            </div>
            {piecesData.map((piece, index) => (
              <div
                key={index}
                className="grid grid-cols-7 items-center p-4 border-b last:border-b-0"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <Image
                    src="/images/placeholder-art.png"
                    alt={piece.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <span className="font-semibold text-black">{piece.name}</span>
                </div>
                <div className="text-gray-600">{piece.artist}</div>
                <div className="text-gray-600">{piece.type}</div>
                <div className="text-gray-600">
                  <span className="text-gray-400">Price</span>{' '}
                  <span className="font-semibold text-black">{piece.price}</span>
                </div>
                <div className="text-gray-600">
                  <span className="text-gray-400">Perks</span>{' '}
                  <span className="font-semibold text-black">{piece.perks}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                  {piece.status === 'pending' ? (
                    <ClockIcon className="h-6 w-6 text-orange-500" />
                  ) : (
                    <CheckIcon className="h-6 w-6 text-green-500" />
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
