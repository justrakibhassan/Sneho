import prisma from "../config/db.js";
// @desc    Get all emergency contacts for the logged-in user
// @route   GET /api/emergency-contacts
// @access  Private
export const getContacts = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const contacts = await prisma.emergency_contact.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ success: true, data: contacts });
    }
    catch (error) {
        console.error("Get Contacts Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Add a new emergency contact
export const addContact = async (req, res) => {
    try {
        const { name, phoneNumber, relationship } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        if (!name || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Name and phone number are required",
            });
        }
        const count = await prisma.emergency_contact.count({ where: { userId } });
        if (count >= 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 emergency contacts allowed",
            });
        }
        const contact = await prisma.emergency_contact.create({
            data: {
                userId,
                name,
                phoneNumber,
                relationship,
            },
        });
        res.status(201).json({ success: true, data: contact });
    }
    catch (error) {
        console.error("Add Contact Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Update an emergency contact
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, relationship } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const contact = await prisma.emergency_contact.findUnique({
            where: { id: parseInt(id) },
        });
        if (!contact || contact.userId !== userId) {
            return res
                .status(404)
                .json({ success: false, message: "Contact not found" });
        }
        const updatedContact = await prisma.emergency_contact.update({
            where: { id: parseInt(id) },
            data: {
                name: name || contact.name,
                phoneNumber: phoneNumber || contact.phoneNumber,
                relationship: relationship || contact.relationship,
            },
        });
        res.status(200).json({ success: true, data: updatedContact });
    }
    catch (error) {
        console.error("Update Contact Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Delete an emergency contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userRequest = req.user;
        const userId = userRequest.id;
        const contact = await prisma.emergency_contact.findUnique({
            where: { id: parseInt(id) },
        });
        if (!contact || contact.userId !== userId) {
            return res
                .status(404)
                .json({ success: false, message: "Contact not found" });
        }
        await prisma.emergency_contact.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ success: true, message: "Contact deleted" });
    }
    catch (error) {
        console.error("Delete Contact Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
