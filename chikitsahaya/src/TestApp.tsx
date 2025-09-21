import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ChikitsaHaya Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h2>Test Status: ✅ SUCCESS</h2>
        <p>The basic React setup is functioning correctly.</p>
      </div>
    </div>
  );
};

export default TestApp;
