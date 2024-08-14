interface IInkAbiTypeDef {
  id: number;
  type: {
    def: {
      composite?: {
        fields: {
          type: number;
          typeName?: string;
          name?: string;
        }[];
      };
      array?: {
        len: number;
        type: number;
      };
      primitive?: string;
      sequence?: {
        type: number;
      };
      tuple?: number[];
      variant?: {
        variants: {
          index: number;
          name: string;
          fields?: {
            type: number;
            typeName?: string;
          }[];
        }[];
      };
    };
    path?: string[];
    params?: {
      name: string;
      type: number;
    }[];
  };
}

interface IInkAbiType {
  type: number;
  displayName: string[];
}

interface IInkAbiArg {
  docs: string[];
  type: IInkAbiType;
  label: string;
  indexed?: boolean;
}

interface IInkAbiEvent {
  args: IInkAbiArg[];
  docs: string[];
  label: string;
}

interface IInkAbiMessage {
  args: IInkAbiArg[];
  docs: string[];
  label: string;
  default: boolean;
  mutates: boolean;
  payable: boolean;
  selector: string;
  returnType: IInkAbiType;
}

interface IInkAbiSpec {
  docs: string[];
  events: IInkAbiEvent[];
  messages: IInkAbiMessage[];
  types: IInkAbiTypeDef[];
}

interface IInkAbi {
  spec: IInkAbiSpec;
  types: IInkAbiTypeDef[];
}

interface IAbiEventsOutput {
  contracts: IAbiEventsOutputContract[];
}

interface IAbiEventsOutputContract {
  name: string;
  address: string;
  events: IAbiEventsOutputContractEvent[];
}

interface IAbiEventsOutputContractEvent {
  name: string;
  args: IAbiEventsOutputContractEventArg[];
}

interface IAbiEventsOutputContractEventArg {
  name: string;
  type: string;
}

interface IAbiCallsOutput {
  contracts: IAbiCallsOutputContract[];
}

interface IAbiCallsOutputContract {
  name: string;
  address: string;
  calls: IAbiCallsOutputContractCall[];
}

interface IAbiCallsOutputContractCall {
  name: string;
  selector: string;
  args: IAbiCallsOutputContractCallArg[];
}

interface IAbiCallsOutputContractCallArg {
  name: string;
  type: string;
}

interface IEvmAbi extends Array<IEvmAbiItem> {}

interface IEvmAbiItem {
  type: 'function' | 'constructor' | 'event' | 'fallback' | 'receive';
  name?: string; // Only functions and events have names
  inputs?: IEvmAbiInputOutput[];
  outputs?: IEvmAbiInputOutput[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean; // Only events can be anonymous
  payable?: boolean; // Deprecated in favor of stateMutability
  constant?: boolean; // Deprecated in favor of stateMutability
}

interface IEvmAbiInputOutput {
  name: string;
  type: string; // Solidity types like 'uint256', 'address', 'bytes32', etc.
  internalType?: string; // Optionally provides the internal Solidity type
  indexed?: boolean; // Only events' inputs can be indexed
}

interface IEvmEventAbiItem extends IEvmAbiItem {
  type: 'event';
  anonymous?: boolean;
  inputs: IEvmAbiInputOutput[];
}

interface IEvmFunctionAbiItem extends IEvmAbiItem {
  type: 'function';
  constant?: boolean;
  payable?: boolean;
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  inputs: IEvmAbiInputOutput[];
  outputs: IEvmAbiInputOutput[];
}

interface IEvmConstructorAbiItem extends IEvmAbiItem {
  type: 'constructor';
  stateMutability: 'nonpayable' | 'payable';
  inputs: IEvmAbiInputOutput[];
}

interface IEvmFallbackAbiItem extends IEvmAbiItem {
  type: 'fallback' | 'receive';
  stateMutability: 'nonpayable' | 'payable';
}

export {
  IInkAbi,
  IInkAbiArg,
  IInkAbiEvent,
  IInkAbiMessage,
  IInkAbiSpec,
  IInkAbiType,
  IInkAbiTypeDef,
  IAbiEventsOutput,
  IAbiEventsOutputContract,
  IAbiEventsOutputContractEvent,
  IAbiEventsOutputContractEventArg,
  IAbiCallsOutput,
  IAbiCallsOutputContract,
  IAbiCallsOutputContractCall,
  IAbiCallsOutputContractCallArg,
  IEvmAbi,
  IEvmAbiItem,
  IEvmAbiInputOutput,
  IEvmConstructorAbiItem,
  IEvmEventAbiItem,
  IEvmFallbackAbiItem,
  IEvmFunctionAbiItem,
};
