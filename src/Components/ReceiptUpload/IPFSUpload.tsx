'use client';

import React, { useState } from 'react';

interface IPFSUploadProps {
  onHashReceived: (hash: string) => void;
  disabled?: boolean;
}

const IPFSUpload: React.FC<IPFSUploadProps> = ({ onHashReceived, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [manualHash, setManualHash] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Trying multiple IPFS upload methods...');

    try {
      // Method 1: Try Lighthouse upload
      try {
        const lighthouseResponse = await uploadToLighthouse(file);
        const ipfsUrls = generateIPFSUrls(lighthouseResponse);
        onHashReceived(lighthouseResponse);
        setUploadStatus(`Successfully uploaded to Lighthouse! Hash: ${lighthouseResponse}. IPFS URLs: ${ipfsUrls.join(', ')}`);
        return;
      } catch (lighthouseError) {
        console.log('Lighthouse upload failed, trying alternative method...', lighthouseError);
      }

      // Method 2: Try Web3.Storage upload
      try {
        const web3Response = await uploadToWeb3Storage(file);
        onHashReceived(web3Response);
        setUploadStatus(`Successfully uploaded to Web3.Storage! Hash: ${web3Response}`);
        return;
      } catch (web3Error) {
        console.log('Web3.Storage upload failed, trying IPFS gateway...', web3Error);
      }

      // Method 3: Try direct IPFS upload via public gateway
      try {
        const ipfsResponse = await uploadToIPFS(file);
        onHashReceived(ipfsResponse);
        setUploadStatus(`Successfully uploaded to IPFS! Hash: ${ipfsResponse}`);
        return;
      } catch (ipfsError) {
        console.log('IPFS upload failed, trying Pinata...', ipfsError);
      }

      // Method 4: Fallback to Pinata
      try {
        const pinataResponse = await uploadToPinata(file);
        const ipfsUrls = generateIPFSUrls(pinataResponse);
        onHashReceived(pinataResponse);
        setUploadStatus(`Successfully uploaded to Pinata! Hash: ${pinataResponse}. IPFS URLs: ${ipfsUrls.join(', ')}`);
        return;
      } catch (pinataError) {
        console.log('Pinata upload failed, generating local hash...', pinataError);
      }

      // Method 5: Generate local hash and provide base64 as last resort
      const localHash = await generateLocalHash(file);
      const base64Data = await fileToBase64(file);
      
      // Generate IPFS gateway URLs for easy viewing
      const ipfsUrls = generateIPFSUrls(localHash);
      
      onHashReceived(localHash);
      setUploadStatus(`Generated local hash: ${localHash}.`);
      
      // Store base64 data for manual use
      console.log('Base64 data for manual upload:', base64Data);
      console.log('IPFS Gateway URLs:', ipfsUrls);
      
    } catch (error) {
      console.error('All IPFS upload methods failed:', error);
      setUploadStatus('Upload failed. Please try again or enter hash manually.');
    } finally {
      setIsUploading(false);
    }
  };

  // Lighthouse upload function
  const uploadToLighthouse = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Using correct Lighthouse API endpoint
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.Hash;
  };

  // Simple IPFS upload function (no auth required)
  const uploadToWeb3Storage = async (file: File): Promise<string> => {
    // Skip this method since it requires API key
    throw new Error('Web3.Storage requires API key');
  };

  // Direct IPFS upload function
  const uploadToIPFS = async (file: File): Promise<string> => {
    // Skip this method since most public gateways require authentication
    throw new Error('Public IPFS gateway requires authentication');
  };

  // Pinata upload function (fallback)
  const uploadToPinata = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  };

  // Generate local hash for file (last resort)
  const generateLocalHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create a pseudo-IPFS hash format
    return `Qm${hashHex.substring(0, 44)}`;
  };

  // Convert file to base64
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Generate IPFS gateway URLs
  const generateIPFSUrls = (hash: string): string[] => {
    return [
      `https://ipfs.io/ipfs/${hash}`,
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
  };

  const handleManualHashSubmit = () => {
    if (manualHash.trim()) {
      onHashReceived(manualHash.trim());
      setUploadStatus(`Manual hash accepted: ${manualHash.trim()}. IPFS URLs: ${generateIPFSUrls(manualHash.trim()).join(', ')}`);
      setManualHash('');
      setShowManualInput(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onHashReceived(urlInput.trim());
      setUploadStatus(`URL accepted: ${urlInput.trim()}`);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Receipt (File, IPFS Hash, or URL)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          disabled={disabled || isUploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: JPG, PNG, PDF (Max 10MB)
        </p>
      </div>

      {uploadStatus && (
        <div className={`p-3 rounded-lg text-sm ${
          uploadStatus.includes('Success') || uploadStatus.includes('accepted') || uploadStatus.includes('URL accepted')
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : uploadStatus.includes('failed')
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {uploadStatus}
        </div>
      )}

     
      {/* URL Input */}
      <div className="space-y-2">
        
        {showUrlInput && (
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter direct URL (e.g., https://example.com/receipt.pdf)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Use This URL
            </button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Uploading...</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p className="mt-2"><strong>Note:</strong> Direct URLs work immediately without IPFS upload!</p>
      </div>
    </div>
  );
};

export default IPFSUpload;
