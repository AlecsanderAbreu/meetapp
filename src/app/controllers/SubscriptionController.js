import { isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async store(req, res) {
    const { meetup_id } = req.body;

    const meetup = await Meetup.findByPk(meetup_id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }
    });
    const user = await User.findByPk(req.userId);

    /**
     * Meetup Exists
     */
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    /**
     * Meetup not passed
     */
    const meetupNotPassed = !isBefore(meetup.date, new Date());

    if (!meetupNotPassed) {
      return res
        .status(400)
        .json({ error: "Meetup has passed, can't subscribe" });
    }

    /**
     * Same time
     */
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date
          }
        }
      ]
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
