import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const { date } = req.body;

    const dateIsValid = !isBefore(parseISO(date), new Date());

    if (!dateIsValid) {
      return res.status(400).json({ error: 'Date invalid, has passed' });
    }

    const meetup = await Meetup.create(req.body);

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Meetup Exists
     */
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists' });
    }

    /**
     * Owner Update
     */
    if (meetup.user_id != req.userId) {
      return res
        .status(400)
        .json({ error: 'Only owner can update this meetup' });
    }

    /**
     * Meetup not passed
     */
    const meetupNotPassed = !isBefore(meetup.date, new Date());

    if (!meetupNotPassed) {
      return res.status(400).json({ error: "Meetup passed, can't update" });
    }

    /**
     * New date not passed
     */
    const dateIsValid = !isBefore(parseISO(req.body.date), new Date());

    if (!dateIsValid) {
      return res.status(400).json({ error: 'Date invalid, has passed' });
    }

    const {
      id,
      title,
      description,
      location,
      date,
      user_id,
      banner_id
    } = await meetup.update(req.body);

    return res.json({
      id,
      title,
      description,
      location,
      date,
      user_id,
      banner_id
    });
  }
}

export default new MeetupController();
