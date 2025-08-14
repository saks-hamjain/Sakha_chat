import React, { useState } from 'react'
import { 
    Button, 
    CloseButton, 
    Dialog, 
    IconButton, 
    Portal, 
    Text, 
    Box
} from "@chakra-ui/react"

const ProfileModal = ({ user, children }) => {
   const [isOpen, setIsOpen] = useState(false);
   const onOpen = () => setIsOpen(true);
   const onClose = () => setIsOpen(false);
   
  return (
       <>
        {
            children ? (<span onClick={onOpen}>{children}</span>) : (<IconButton d={{ base: "flex" }} icon={<i className="fas fa-user-circle"></i>} onClick={onOpen} />) 
        }
        <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="lg" centered>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content >
                        <Dialog.Header alignItems="center" display="flex" justifyContent="space-between">
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Text fontSize="2xl" fontWeight="bold">Profile</Text>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton />
                                </Dialog.CloseTrigger>
                            </Box>
                        </Dialog.Header>
                        <Dialog.Body textAlign="center">
                            {/* Profile content goes here */}
                            <Text fontSize="xl" fontWeight="bold" mb={4}>{user?.name}</Text>
                             {user?.pic && (
                                <Box mt={4} mb={4} display="flex" justifyContent="center">
                                    <img 
                                        src={user.pic} 
                                        alt={user.name}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid #3182ce'
                                        }}
                                    />
                                </Box>
                            )}
                            <Text fontSize="lg" color="gray.600">Email: {user?.email}</Text>
                            
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button colorScheme="blue" onClick={onClose}>Close</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
       </>
  )
}

export default ProfileModal