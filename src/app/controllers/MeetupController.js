import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { date, page = 1, limit = 10 } = req.query;

    const where = {
      date: {
        [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))]
      }
    };

    const meetups = await Meetup.findAll({
      where: date ? where : null,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'path']
        }
      ],
      order: ['date'],
      limit: limit,
      offset: (page - 1) * limit
    });

    return res.json(meetups);
  }

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

  async delete(req, res) {
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

    await Meetup.destroy({ where: { id: meetup.id } });

    return res.json({ message: 'Meetup deleted successfully' });
  }
}

export default new MeetupController();
