import React from 'react'
import { Box, Spinner } from '@chakra-ui/react'

const Chatloading = () => {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
        <Box w="100%" h="60px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="sm" />
        </Box>
        <Box w="100%" h="60px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="sm" />
        </Box>
        <Box w="100%" h="60px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="sm" />
        </Box>     
    </Box>
  )
}

export default Chatloading