import React, { useEffect } from 'react';

export default function Header() {
  useEffect(() => {
    document.title = "Multi Sender";
  }, []);

  return (
    <header>
     
    </header>
  );
}