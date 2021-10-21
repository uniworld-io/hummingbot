import { patch, unpatch } from '../../services/patch';
import { providers } from 'ethers';
import { EVMNonceManager } from '../../../src/chains/ethereum/evm.nonce';
import 'jest-extended';

const exampleAddress = '0xFaA12FD102FE8623C9299c72B03E45107F2772B5';

afterEach(() => {
  unpatch();
});

describe('unitiated EVMNodeService', () => {
  let nonceManager: EVMNonceManager;
  beforeAll(() => {
    nonceManager = EVMNonceManager.getInstance();
  });

  it('mergeNonceFromEVMNode throws error', async () => {
    await expect(
      nonceManager.mergeNonceFromEVMNode(exampleAddress)
    ).rejects.toThrow(
      'EVMNonceManager.mergeNonceFromEVMNode called before initiated'
    );
  });

  it('getNonce throws error', async () => {
    await expect(nonceManager.getNonce(exampleAddress)).rejects.toThrow(
      'EVMNonceManager.getNonce called before initiated'
    );
  });

  it('commitNonce (txNonce null) throws error', async () => {
    await expect(nonceManager.commitNonce(exampleAddress)).rejects.toThrow(
      'EVMNonceManager.commitNonce called before initiated'
    );
  });

  it('commitNonce (txNonce not null) throws error', async () => {
    await expect(nonceManager.commitNonce(exampleAddress, 87)).rejects.toThrow(
      'EVMNonceManager.commitNonce called before initiated'
    );
  });
});

describe('EVMNodeService', () => {
  let nonceManager: EVMNonceManager;
  beforeAll(() => {
    nonceManager = EVMNonceManager.getInstance();
    const provider = new providers.StaticJsonRpcProvider(
      'https://ethereum.node.com'
    );
    nonceManager.init(provider, 0);
  });

  const patchGetTransactionCount = () => {
    if (nonceManager._provider) {
      patch(nonceManager._provider, 'getTransactionCount', () => 11);
    }
  };

  it('commitNonce with a provided txNonce should increase the nonce by 1', async () => {
    await nonceManager.commitNonce(exampleAddress, 10);
    const nonce = await nonceManager.getNonce(exampleAddress);
    await expect(nonce).toEqual(11);
  });

  it('mergeNonceFromEVMNode should update with the maximum nonce source (node)', async () => {
    patchGetTransactionCount();

    await nonceManager.commitNonce(exampleAddress, 10);
    await nonceManager.mergeNonceFromEVMNode(exampleAddress);
    const nonce = await nonceManager.getNonce(exampleAddress);
    await expect(nonce).toEqual(11);
  });

  it('mergeNonceFromEVMNode should update with the maximum nonce source (local)', async () => {
    patchGetTransactionCount();

    await nonceManager.commitNonce(exampleAddress, 20);
    await nonceManager.mergeNonceFromEVMNode(exampleAddress);
    const nonce = await nonceManager.getNonce(exampleAddress);
    await expect(nonce).toEqual(21);
  });
});