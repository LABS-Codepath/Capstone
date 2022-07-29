import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuthContext } from '../../contexts/auth';
import { Container, Button, FormLabel, Checkbox, Alert, AlertIcon,
  AlertDescription, CheckboxGroup, Text, Box, Stack, HStack,
} from '@chakra-ui/react';

export default function EventRegistration({ games }) {
  const { user } = useAuthContext()
  const { eventId } = useParams()
  const [checkedItems, setCheckedItems] = useState([])
  const [errors, setErrors] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [action, setAction] = useState()

  useEffect(() => {  
    const setItems = async() => {
      if(games.game) {
        setCheckedItems(new Array(games.game.length).fill(false))
      }
    }
    setItems()

    const getIsRegistered = async() => {
      const { data, error } = await apiClient.isUserRegistered(eventId, user.id)
       if(data) {
        setErrors(null)
        setIsRegistered(true)
       }
       if (error) {
        setErrors(error)
       }   
    }
    getIsRegistered()    
  }, [games.game, user.id, eventId]);

  function replaceAt(array, index, value) {
    const newArray = array.slice(0)
    newArray[index] = value
    return newArray
  }

  function getGamesRegistered(gameArray) {
    let registeredArray = []
    for(let i = 0; i < gameArray.length; i++) {
      if(gameArray[i]) {
        registeredArray.push(games.game[i].id)
      }   
    }
    return registeredArray
  }

  const handleOnSubmit = async () => {
    setErrors(error => ({...error, form: null}))
    const { data, error } = await apiClient.registerForEvent({
      eventId: eventId,
      eventGame: getGamesRegistered(checkedItems),
    })
    if(data) {
      setIsRegistered(true)
      setAction(true)
    }
    if(error) setErrors((e) => ({ ...e, form: error}))
  }

  const handleWithdraw = async () => {
    setErrors(error => ({...error, form: null}))
    const { data, error } = await apiClient.withdrawFromEvent({
      eventId: eventId,
    })
    if(data) {
      setIsRegistered(false)
      setAction(false)
    }
    if (error) setErrors((e) => ({ ...e, form: error}))
  }

  return (
    <Container position={"relative"}>
      <FormLabel htmlFor="eventGame">
        <Text fontSize={"lg"} textAlign={"center"}>Event Registration</Text>
      </FormLabel>
      <Box>
          <Stack>
              <HStack spacing={4}>
                  <CheckboxGroup size="lg" isDisabled={action || isRegistered}>
                      {games.game?.map((game, index) => (
                        <Checkbox margin={2} key={game.id} value={game.name}  isChecked={checkedItems[index]} 
                        onChange={e => setCheckedItems(replaceAt(checkedItems, index, e.target.checked))}>
                        {game.name}
                        </Checkbox>
                      ))}
                  </CheckboxGroup>
              </HStack>
          </Stack>
      </Box>
      <Box position={"relative"} paddingLeft={"20px"}>
          {
            action === true ? 
            <AlertBox message={"Registered successfully!"}/>
            : action === false ?
            <AlertBox message={"Withdrew successfully!"}/>
            : null
          }
          {
            isRegistered ? 
            <Button margin={2} colorScheme="purple" mr={3} onClick={handleWithdraw}>Withdraw</Button>
            : 
            <Button margin={2} colorScheme="purple" mr={3} onClick={handleOnSubmit}>Register</Button>
          }
          
      </Box>
    </Container>
  );
}

export function AlertBox({ message}) {
  return (
    <Alert status='success'>
      <AlertIcon />
      <Box>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Box>
    </Alert>
  )
}