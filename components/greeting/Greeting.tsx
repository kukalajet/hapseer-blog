import React from 'react';

export const Greeting = ({ name }: { name: string }) => {
  return <div className="text-xl font-bold text-green-500">Hello, {name}!</div>;
};
