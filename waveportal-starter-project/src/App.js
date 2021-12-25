import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import styled from "styled-components";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const WalletContainer = styled.div`
  padding: 2rem 0rem;
`;

const Title = styled.h1`
  font-size: 4rem;
`;

const Content = styled.span`
  font-size: 2rem;
  width: 60%;
  text-align: center;
`;

const MessageContainer = styled.div`
  border: 1px solid;
  border-radius: 20px;
  margin-top: 16px;
  padding: 1rem;
`;

const MessageHeaderContainer = styled.div`
  display: flex;
  padding-bottom: 1rem;
`;

const AddressText = styled.span`
  font-size: 0.8rem;
  padding-right: 3rem;
`;

const TimeText = styled.span`
  font-size: 0.8rem;
`;

const Input = styled.input`
  width: 40%;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background: #fff;
  border: 1px solid;
  border-radius: 20px;
`;

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [numberWaves, setNumberWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x828f7e3F385cbAE2060B7B843A110D3163dd73Ee";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const loadWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        setNumberWaves(count.toNumber());

        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        setNumberWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    loadWaves();
  }, []);

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <Container>
      <TitleContainer>
        <Title>Welcome to 👋 dApp</Title>
        <Content>
          Connect your wallet and wave at me! You have 50% chance to win 0.0001
          ether
        </Content>
      </TitleContainer>
      <WalletContainer>
        {!currentAccount ? (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <div>
            Connected: {currentAccount.slice(0, 5)}...{currentAccount.slice(-4)}
          </div>
        )}
      </WalletContainer>
      <Input
        placeholder="Input you message here..."
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />
      <Button className="waveButton" onClick={wave}>
        Wave at me
      </Button>

      {allWaves.map((wave, index) => {
        var dateString =
          ("0" + (wave.timestamp.getUTCMonth() + 1)).slice(-2) +
          "/" +
          ("0" + wave.timestamp.getUTCDate()).slice(-2) +
          "/" +
          wave.timestamp.getUTCFullYear() +
          " " +
          ("0" + wave.timestamp.getUTCHours()).slice(-2) +
          ":" +
          ("0" + wave.timestamp.getUTCMinutes()).slice(-2) +
          ":" +
          ("0" + wave.timestamp.getUTCSeconds()).slice(-2);
        return (
          <MessageContainer key={index}>
            <MessageHeaderContainer>
              <AddressText>
                {wave.address.slice(0, 5)}...{wave.address.slice(-4)} says:
              </AddressText>
              <TimeText>{dateString}</TimeText>
            </MessageHeaderContainer>

            <div>Message: {wave.message}</div>
          </MessageContainer>
        );
      })}
    </Container>
  );
}
