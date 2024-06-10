interface IAbiTypeDef {
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

interface IAbiType {
  type: number;
  displayName: string[];
}

interface IAbiArg {
  docs: string[];
  type: IAbiType;
  label: string;
  indexed?: boolean;
}

interface IAbiEvent {
  args: IAbiArg[];
  docs: string[];
  label: string;
}

interface IAbiMessage {
  args: IAbiArg[];
  docs: string[];
  label: string;
  default: boolean;
  mutates: boolean;
  payable: boolean;
  selector: string;
  returnType: IAbiType;
}

interface IAbiSpec {
  docs: string[];
  events: IAbiEvent[];
  messages: IAbiMessage[];
  types: IAbiTypeDef[];
}

interface IAbi {
  spec: IAbiSpec;
  types: IAbiTypeDef[];
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

export {
  IAbi,
  IAbiArg,
  IAbiEvent,
  IAbiMessage,
  IAbiSpec,
  IAbiType,
  IAbiTypeDef,
  IAbiEventsOutput,
  IAbiEventsOutputContract,
  IAbiEventsOutputContractEvent,
  IAbiEventsOutputContractEventArg,
  IAbiCallsOutput,
  IAbiCallsOutputContract,
  IAbiCallsOutputContractCall,
  IAbiCallsOutputContractCallArg,
};
