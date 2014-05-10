	// Add TinyCore to the environment.
	oEnv.TinyCore = TinyCore;

	if ( oEnv.define && oEnv.define.amd )
	{
		oEnv.define( 'TinyCore', TinyCore );
	}

	if ( oEnv.module && oEnv.module.exports )
	{
		oEnv.module.exports = TinyCore;
	}
} ( this ) );
