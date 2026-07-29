import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const FeatureBanner = () => {
  const features = [
    {
      icon: <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: 'Free Shipping',
      desc: 'Free shipping on all orders over $100. Express delivery available.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: 'Secure Payment',
      desc: 'Your payment information is processed securely with SSL encryption.',
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: 'Easy Returns',
      desc: '30-day return policy. No questions asked, hassle-free returns.',
    },
    {
      icon: <Headphones className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      title: '24/7 Support',
      desc: 'Our support team is available around the clock to assist you.',
    },
  ];

  return (
    <section className="border-y border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
