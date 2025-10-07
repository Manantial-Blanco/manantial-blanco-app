'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Check as CheckIcon, Clock as ClockIcon, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';
import { Dictionary, Locale } from '@/types';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { PRIMARY_COLOR } from '@/lib/constants/colors';

interface SummaryData {
  title: string;
  value: string;
  unit: string;
}

interface Movement {
  from: string;
  time: string;
  amount: string;
  status: 'pending' | 'completed';
}

interface Piece {
  name: string;
  artist: string;
  type: string;
  price: string;
  perks: string;
  status: 'pending' | 'completed';
  imageUrl?: string;
}

interface DashboardData {
  summary: {
    published: number;
    registered: number;
    earnedPerks: string;
    totalIncome: string;
  };
  movements: Movement[];
  pieces: Piece[];
}

interface HomePageClientProps {
  lang: Locale;
  dict: Dictionary;
}

export default function HomePageClient({ lang, dict }: HomePageClientProps) {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/artist/dashboard?wallet=${address}`);

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();

        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [address]);

  const summaryData: SummaryData[] = dashboardData ? [
    { title: 'Published', value: String(dashboardData.summary.published), unit: 'Pieces' },
    { title: 'Registered', value: String(dashboardData.summary.registered), unit: 'Pieces' },
    { title: 'Earned Perks', value: dashboardData.summary.earnedPerks, unit: 'USD' },
    { title: 'Total Income', value: dashboardData.summary.totalIncome, unit: 'USD' },
  ] : [];

  const movementsData = dashboardData?.movements || [];
  const piecesData = dashboardData?.pieces || [];

  // Show wallet connection prompt if not connected
  if (!isConnected && !isConnecting) {
    return (
      <>
        <NavigationHeader lang={lang} dict={dict} />
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold text-black mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your artist dashboard and IP assets from Story Protocol.
              </p>
              <p className="text-sm text-gray-500">
                Click the &quot;Connect Wallet&quot; button in the navigation header to get started.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show loading state while fetching data
  if (loading || isConnecting) {
    return (
      <>
        <NavigationHeader lang={lang} dict={dict} />
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isConnecting ? 'Connecting wallet...' : 'Loading dashboard...'}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <NavigationHeader lang={lang} dict={dict} />
        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-gray-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Error loading dashboard</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavigationHeader lang={lang} dict={dict} />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 bg-gray-50">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold text-black">Artist Panel</h2>
            <Button 
              onClick={() => router.push(`/${lang}/register-piece`)}
              className="text-white rounded-full px-6 py-3 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#486B91' }}
            >
              Register Piece
            </Button>
          </div>
          {address && (
            <p className="text-sm text-gray-500">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
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
                  {piece.imageUrl ? (
                    <Image
                      src={piece.imageUrl}
                      alt={piece.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                      onError={(e) => {
                        // If image fails to load, replace with blank placeholder
                        e.currentTarget.style.display = 'none';
                        const nextEl = e.currentTarget.nextElementSibling;
                        if (nextEl) nextEl.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 bg-gray-100 rounded flex items-center justify-center ${piece.imageUrl ? 'hidden' : ''}`}
                  >
                    <span className="text-gray-400 text-xs">No img</span>
                  </div>
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
