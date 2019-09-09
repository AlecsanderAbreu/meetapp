import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Inscrição realizada',
      template: 'subscription',
      context: {
        owner: meetup.user.name,
        title: meetup.title,
        user: user.name,
        date: format(new Date(), "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt
        })
      }
    });
  }
}

export default new SubscriptionMail();
