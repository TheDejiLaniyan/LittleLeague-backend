const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { password, email } = req.body

    if ( !password || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundEmail = await User.findOne({ email }).exec()

    if (!foundEmail) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundEmail.password)

    if (!match) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundEmail.email,
                "roles": foundEmail.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
    )

    const refreshToken = jwt.sign(
        { "email": foundEmail.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing email and roles 
    res.json({ accessToken })
})

const register = asyncHandler(async(req, res) => {
    const {username, password, email} = req.body
    
   try{
        if (!username || !password  || !email) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const duplicate = await User.findOne({ username }).exec()

        if (duplicate) {
            return res.status(409).json({ message: 'Username has been taken!' })
        }

        const exists = await User.findOne({email}).exec()
        if(exists){
            return res.status(408).json({message: 'Email has been taken'})
        }

        user = new User({
            username,
            password,
            email,
            roles : 'Tier1'
        })

        // hash user password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {
              id: user.id,
            },
          };
    
          jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
   }catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
   }
}) 

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundEmail = await User.findOne({ email: decoded.email }).exec()

            if (!foundEmail) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundEmail.email,
                        "roles": foundEmail.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        })
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    register,
    refresh,
    logout
}