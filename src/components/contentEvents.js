import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './contentEvents.css';


function ContentEvents() {
    return (
        <Row xs={1} md={3} className="g-4">
            {[1, 2, 3, 4].map((num) => (
        <Col key={num}>
          <Card>
            <Card.Img variant="top" src="./logo192.png" />
            <Card.Body>
              <Card.Title>Card Title {num}</Card.Title>
              <Card.Text>
                This is card number {num}.
              </Card.Text>
              <Button variant="primary">Learn more</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
    );
}

export default ContentEvents;