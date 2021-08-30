import { auto } from '@popperjs/core';
import React from 'react';
import { Button, Form, Grid, Header, Segment, Image } from 'semantic-ui-react';
import bulldog from '../Custom Styling/Images/Avatars/bulldog.png'

function Login({ user: { username, mobileNumber, verificationCode, verificationSent }, setUser, sendSmsCode, sendCode }) {
    function populateFields(event, data) {
        setUser((draft) => {
            draft[data.name] = data.value;
        })
    }
    return (
        <Grid textAlign='center' verticalAlign='middle' style={{
            height: '100vh',
        }}>
            <Grid.Column width='50%' style={{ maxWidth: '400px',
        width:'85%' }}>
            <Header as='h1' color='white' textAlign='center'>
                    The Goodest Girl
                </Header>
                <Image src = {bulldog} size = 'small' style = {{display: 'block', margin:auto}}></Image>
                <Form>
                    <Segment raised>
                        <Form.Input
                            fluid
                            icon='user'
                            iconPosition='left'
                            placeHolder='Username'
                            value={username}
                            onChange={(event, data) => {
                                populateFields(event, data)
                            }}
                            name='username'>
                        </Form.Input>
                        <Form.Input fluid
                            icon='mobile alternate'
                            iconPosition='left'
                            placeHolder='Mobile Number'
                            value={mobileNumber}
                            onChange={(event, data) => {
                                populateFields(event, data);
                            }}
                            name='mobileNumber'>
                        </Form.Input>
                        {verificationSent &&
                        <Form.Input
                            fluid
                            icon='key'
                            iconPosition='left'
                            placeHolder='Verify Code Here'
                            value={verificationCode}
                            onChange={(event, data) => {
                                populateFields(event, data)
                            }}
                            name='verificationCode'>
                        </Form.Input>}
                        <Button
                            fluid
                            onClick={sendSmsCode}
                            disabled = {verificationSent === true}
                            >Send Code</Button>
                            {verificationSent &&
                            <Button
                            color = 'cadetBlue'
                            onClick={sendCode}
                            name = 'sendCode'
                            fluid>Sign In
                            </Button>}
                    </Segment>
                </Form>
            </Grid.Column>
        </Grid>
    )
}

export default Login;