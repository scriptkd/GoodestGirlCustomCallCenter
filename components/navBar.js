import React from "react";
import { Container, Menu, Image } from 'semantic-ui-react';
import bulldog from '../Custom Styling/Images/Avatars/bulldog.png';

function NavBar() {
    return <Menu>
        <Container fluid>
            <Menu.Item header><Image src = {bulldog} verticalAlign = 'middle' size = 'mini'></Image>The Goodest Girl</Menu.Item>
            <Menu.Item position = 'right'><Image src='https://semantic-ui.com/images/avatar/large/christian.jpg' avatar></Image>Jimmie Smith</Menu.Item>
        </Container>
    </Menu>
}

export default NavBar;