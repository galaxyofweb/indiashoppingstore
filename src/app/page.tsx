import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white text-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Welcome to India Shopping Store</h1>
        <p className="text-xl text-gray-600">Your store is successfully connected and running!</p>
      </div>
      
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left gap-4">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">Products</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Browse our latest collection of amazing products.</p>
        </div>
      </div>
    </main>
  );
}
