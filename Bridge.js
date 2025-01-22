import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ConnectButton, useWalletKit } from '@mysten/wallet-kit';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// If using Next.js, use:
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to examine object properties - useful for debugging wallet objects
const debugObject = (obj) => {
  console.log('Object inspection:');
  console.log('- Type:', typeof obj);
  console.log('- Keys:', Object.keys(obj));
  console.log('- Full object:', obj);
  if (obj && typeof obj === 'object') {
    console.log('- Properties:');
    for (let key in obj) {
      console.log(`  ${key}:`, obj[key]);
    }
  }
};

const Bridge = () => {
  // State management for our bridge interface
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('eth-to-sui');
  const [loading, setLoading] = useState(false);
  const [ethAccount, setEthAccount] = useState('');
  const [error, setError] = useState('');
  
  // Get Sui wallet information from the wallet kit
  const { currentAccount, isConnected: isSuiConnected } = useWalletKit();

  // Log wallet states whenever they change
  useEffect(() => {
    console.log('Wallet State Update:');
    console.log('- ETH Account:', ethAccount || 'Not connected');
    console.log('- SUI Account:', currentAccount ? 'Connected' : 'Not connected');
    if (currentAccount) {
      console.log('SUI Account details:');
      debugObject(currentAccount);
    }
  }, [ethAccount, currentAccount]);

  // Set up MetaMask account change listener
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('MetaMask accounts changed:', accounts);
        if (accounts.length > 0) {
          setEthAccount(accounts[0]);
          toast.info('Ethereum account changed');
        } else {
          setEthAccount('');
          toast.info('Ethereum wallet disconnected');
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Helper function to safely extract Sui address string from wallet object
  const getSuiAddressString = (account) => {
    console.log('Extracting Sui address from:', account);
    debugObject(account);

    if (!account) return '';
    
    // Handle string addresses directly
    if (typeof account === 'string') {
      console.log('Account is already a string:', account);
      return account;
    }
    
    // Handle object-type accounts
    if (account && typeof account === 'object') {
      if (account.address) {
        console.log('Found address property:', account.address);
        return account.address;
      }
      
      const stringified = String(account);
      if (stringified && stringified !== '[object Object]') {
        console.log('Using string representation:', stringified);
        return stringified;
      }
    }

    console.log('Could not extract valid address from account');
    return '';
  };

  // Validate Sui address format
  const isSuiAddress = (account) => {
    const address = getSuiAddressString(account);
    console.log('Validating Sui address:', {
      originalAccount: account,
      extractedAddress: address
    });
    
    if (!address) return false;
    
    const formatted = address.trim().toLowerCase();
    const isValid = formatted.startsWith('0x') && formatted.length === 66;
    
    console.log('Address validation:', {
      formatted,
      isValid,
      length: formatted.length,
      startsWithHex: formatted.startsWith('0x')
    });
    
    return isValid;
  };

  // Format address for display
  const formatDisplayAddress = (address) => {
    const addressStr = getSuiAddressString(address);
    if (!addressStr) return '';
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  // Handle Ethereum wallet connection
  const handleConnectEth = async () => {
    setError('');
    console.log('Attempting to connect to MetaMask...');
    
    if (!window.ethereum) {
      const errorMsg = 'MetaMask is not installed! Please install MetaMask to continue.';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log('MetaMask connected successfully:', accounts[0]);
      setEthAccount(accounts[0]);
      toast.success('Ethereum wallet connected successfully!');
    } catch (error) {
      const errorMsg = 'Failed to connect Ethereum wallet. Please try again.';
      console.error('Error connecting to MetaMask:', error);
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handle bridge operation
  const handleBridge = async (e) => {
    e.preventDefault();
    setError('');

    console.log('\nInitiating bridge transaction:');
    console.log('Raw wallet states:');
    console.log('- ETH Account:', ethAccount);
    console.log('- SUI Account (raw):', currentAccount);
    
    const suiAddressString = getSuiAddressString(currentAccount);
    console.log('- SUI Account (processed):', suiAddressString);

    // Validation checks
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      const errorMsg = 'Please enter a valid amount';
      console.error('Invalid amount:', amount);
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (!ethAccount) {
      const errorMsg = 'Please connect your Ethereum wallet first';
      console.error('No Ethereum account connected');
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (!isSuiConnected || !currentAccount) {
      const errorMsg = 'Please connect your Sui wallet first';
      console.error('No Sui account connected');
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Process and validate Sui address
    const formattedSuiAccount = suiAddressString.trim().toLowerCase();
    
    console.log('Address processing steps:');
    console.log('1. Raw account:', currentAccount);
    console.log('2. Extracted string:', suiAddressString);
    console.log('3. Formatted address:', formattedSuiAccount);

    if (!isSuiAddress(currentAccount)) {
      const errorMsg = 'Invalid Sui wallet address format';
      console.error('Invalid Sui address format:', formattedSuiAccount);
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const bridgePayload = {
        direction,
        amount,
        ethAccount,
        suiAccount: formattedSuiAccount
      };

      console.log('Sending bridge payload:', bridgePayload);

      const response = await axios.post(`${API_URL}/api/bridge`, bridgePayload);

      console.log('Bridge response:', response.data);

      if (response.status === 200) {
        toast.success('Bridge transaction completed successfully!');
        
        if (response.data.ethTxHash) {
          const truncatedHash = `${response.data.ethTxHash.slice(0, 6)}...${response.data.ethTxHash.slice(-4)}`;
          console.log('Ethereum transaction hash:', response.data.ethTxHash);
          toast.info(`Ethereum Transaction: ${truncatedHash}`);
        }
        if (response.data.mintTxDigest || response.data.burnTxDigest) {
          const txDigest = response.data.mintTxDigest || response.data.burnTxDigest;
          console.log('Sui transaction digest:', txDigest);
          toast.info(`Sui Transaction: ${txDigest.slice(0, 6)}...`);
        }

        setAmount('');
        setError('');
      }
    } catch (error) {
      console.error('Bridge operation failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      const errorMsg = error.response?.data?.message || 'Bridge operation failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full bg-gradient-to-br from-blue-800 via-purple-800 to-black rounded-xl p-6 shadow-2xl">
  <h1 className="text-3xl font-extrabold text-center mb-6 text-gold">Swap Token</h1>

  <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="w-full md:w-1/2 text-center">
      {!ethAccount ? (
        <button
          onClick={handleConnectEth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          disabled={loading}
        >
          Connect MetaMask
        </button>
      ) : (
        <div className="text-gray-200">
          <p className="mb-1 font-medium">MetaMask Connected</p>
          <p className="text-sm">{formatDisplayAddress(ethAccount)}</p>
        </div>
      )}
    </div>
    <div className="w-full md:w-1/2 text-center">
      <ConnectButton className="!bg-blue-600 !hover:bg-blue-700" />
      {currentAccount && (
        <p className="text-sm text-gray-300 mt-1">{formatDisplayAddress(currentAccount)}</p>
      )}
    </div>
  </div>

  <form onSubmit={handleBridge} className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-200 mb-2">Amount to Bridge:</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to bridge"
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
        required
        disabled={loading}
        min="0"
        step="any"
      />
    </div>

    <div className="bg-gray-700 p-4 rounded-lg flex justify-around">
      {/* Ascunde butoanele radio, dar le stilizează folosind un alt element */}
      <label className="inline-flex items-center cursor-pointer text-gray-200">
        <span className="mr-2">Ethereum → Sui</span>
        <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center">
          <input
            type="radio"
            checked={direction === 'eth-to-sui'}
            onChange={() => setDirection('eth-to-sui')}
            className="form-radio hidden"
            disabled={loading}
          />
          {direction === 'eth-to-sui' && <span className="text-white">✔</span>}
        </div>
      </label>
      <label className="inline-flex items-center cursor-pointer text-gray-200">
        <span className="mr-2">Sui → Ethereum</span>
        <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center">
          <input
            type="radio"
            checked={direction === 'sui-to-eth'}
            onChange={() => setDirection('sui-to-eth')}
            className="form-radio hidden"
            disabled={loading}
          />
          {direction === 'sui-to-eth' && <span className="text-white">✔</span>}
        </div>
      </label>
    </div>

    <button
      type="submit"
      disabled={loading || !ethAccount || !currentAccount}
      className={`w-full py-3 rounded-lg font-medium transition-all ${
        loading || !ethAccount || !currentAccount
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700'
      } text-white`}
    >
      {loading ? 'Processing...' : 'Submit'}
    </button>
  </form>

  {error && (
    <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
  )}

  {(!ethAccount || !currentAccount) && !error && (
    <p className="text-yellow-400 text-sm mt-4 text-center">
      Please connect both Ethereum and Sui wallets to proceed
    </p>
  )}
</div>

  );
};

export default Bridge;
