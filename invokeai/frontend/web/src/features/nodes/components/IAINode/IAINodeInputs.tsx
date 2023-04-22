import {
  InputFieldTemplate,
  InputFieldValue,
  InvocationTemplate,
} from 'features/nodes/types/types';
import { MutableRefObject, ReactNode } from 'react';
import { map } from 'lodash';
import { useAppSelector } from 'app/storeHooks';
import { RootState } from 'app/store';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Tooltip,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FieldHandle } from '../FieldHandle';
import { useIsValidConnection } from 'features/nodes/hooks/useIsValidConnection';
import { InputFieldComponent } from '../InputFieldComponent';
import { FaInfoCircle } from 'react-icons/fa';
import { HANDLE_TOOLTIP_OPEN_DELAY } from 'features/nodes/types/constants';

interface IAINodeInputProps {
  nodeId: string;

  input: InputFieldValue;
  template?: InputFieldTemplate | undefined;
  connected: boolean;
}

function IAINodeInput(props: IAINodeInputProps) {
  const { nodeId, input, template, connected } = props;
  const isValidConnection = useIsValidConnection();

  return (
    <Box
      key={input.id}
      position="relative"
      borderColor={
        !template
          ? 'error.400'
          : !connected &&
            ['always', 'connectionOnly'].includes(
              String(template?.inputRequirement)
            ) &&
            input.value === undefined
          ? 'warning.400'
          : undefined
      }
    >
      <FormControl isDisabled={!template ? true : connected} pl={2}>
        {!template ? (
          <HStack justifyContent="space-between" alignItems="center">
            <FormLabel>Unknown input: {input.name}</FormLabel>
          </HStack>
        ) : (
          <>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack>
                <Tooltip
                  label={template?.description}
                  placement="top"
                  hasArrow
                  shouldWrapChildren
                  openDelay={HANDLE_TOOLTIP_OPEN_DELAY}
                >
                  <FormLabel>{template?.title}</FormLabel>
                </Tooltip>
              </HStack>
              <InputFieldComponent
                nodeId={nodeId}
                field={input}
                template={template}
              />
            </HStack>

            {!['never', 'directOnly'].includes(
              template?.inputRequirement ?? ''
            ) && (
              <FieldHandle
                nodeId={nodeId}
                field={template}
                isValidConnection={isValidConnection}
                handleType="target"
              />
            )}
          </>
        )}
      </FormControl>
    </Box>
  );
}

interface IAINodeInputsProps {
  nodeId: string;
  template: MutableRefObject<InvocationTemplate | undefined>;
  inputs: Record<string, InputFieldValue>;
}

export default function IAINodeInputs(props: IAINodeInputsProps) {
  const { nodeId, template, inputs } = props;

  const connectedInputs = useAppSelector(
    (state: RootState) => state.nodes.edges
  );

  const renderIAINodeInputs = () => {
    const IAINodeInputsToRender: ReactNode[] = [];
    const inputSockets = map(inputs);

    inputSockets.forEach((inputSocket, index) => {
      const inputTemplate = template.current?.inputs[inputSocket.name];

      const isConnected = Boolean(
        connectedInputs.filter((connectedInput) => {
          return (
            connectedInput.target === nodeId &&
            connectedInput.targetHandle === inputSocket.name
          );
        }).length
      );

      if (index < inputSockets.length) {
        IAINodeInputsToRender.push(<Divider />);
      }

      IAINodeInputsToRender.push(
        <IAINodeInput
          nodeId={nodeId}
          input={inputSocket}
          template={inputTemplate}
          connected={isConnected}
        />
      );
    });

    return (
      <Flex flexDir="column" gap={2} p={2}>
        {IAINodeInputsToRender}
      </Flex>
    );
  };

  return renderIAINodeInputs();
}
