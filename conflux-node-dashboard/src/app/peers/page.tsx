'use client';
const PeersPage = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Peers
      </h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
        <p className="text-xl">Peer information is not available on this public RPC endpoint.</p>
        <p className="text-gray-400 mt-4">For full node monitoring, connect to your local Conflux node RPC.</p>
      </div>
    </div>
  );
};

export default PeersPage;