export interface WelcomeMessageProps {
  title: string;
  description: string;
  color: string;
  image: string;
}

export class WelcomeMessage {
  public readonly title: string;
  public readonly description: string;
  public readonly color: string;
  public readonly image: string;

  constructor(props: WelcomeMessageProps) {
    this.title = props.title;
    this.description = props.description;
    this.color = props.color;
    this.image = props.image;
  }
}
